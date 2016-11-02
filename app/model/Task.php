<?php

namespace App\Model;

use Nette;
use Nette\Database\Context;

class Task extends Nette\Object{
    const TABLE_TASKS = 'tasks';
    const STATUS_IN_PROGRESS = 0;
    const STATUS_DONE = 1;
    const STATUS_COMPLETE = 2;

    /** @var Nette\Database\Context */
    private $database;

    public function __construct(Nette\Database\Context $database){
        $this->database = $database;
    }

    /**
     * DFS recursion to construct flat (1D) array of a tree
     * @return 1D Array arranged as a flat tree */
    private function buildFlatTree($tasks, $parentId=0, $depth=0){
        $branch = array();
        foreach($tasks as $task){
            if($task['parent_id'] == $parentId){
                $task['depth'] = $depth;
                $children = $this->buildFlatTree($tasks, $task['id'], $depth+1);
                $task['childrenCount'] = count($children);
                if($children){ //Count dependencies and push parent then children
                    // Count dependencies
                    $task['childrenStatuses'] = array('inProgress'=>0, 'done'=>0, 'complete'=>0);
                    foreach($children as $child){
                        switch($child['status']){
                            case self::STATUS_DONE:
                                $task['childrenStatuses']['done']++;
                                break;
                            case self::STATUS_COMPLETE:
                                $task['childrenStatuses']['complete']++;
                                break;
                        }
                    }
                    $branch[] = $task;
                    foreach($children as $child){
                        $branch[] = $child;
                    }
                }else{ //Push parent only
                    $branch[] = $task;
                }
            }
        }
        return $branch;
    }

    private function filterTasks($tasks, $filter){
        $filteredTasks = array();
        foreach($tasks as $task){
            if(in_array($task['status'], $filter)){
                $filteredTasks[] = $task;
            }
        }
        return $filteredTasks;
    }

    
    public function getTasks($filter){
        $taskRows = $this->database->table(self::TABLE_TASKS)->order('id')->fetchAll();
        $tasks = array();
        foreach($taskRows as $taskRow){
            $tasks[] = $taskRow->toArray();
        }
        $tasks = $this->buildFlatTree($tasks);
        if(count($filter) != 3){ // Not all statuses selected
            $tasks = $this->filterTasks($tasks, $filter);
        }

        return $tasks;
    }

    private function getTaskById($taskId){
        return $this->database->table(self::TABLE_TASKS)->get($taskId);
    }

    private function revertCompleteParentsToDone($task){
        $taskId = $task->parent_id;

        while($taskId){
            $task = $this->getTaskById($taskId);
            if($task->status == self::STATUS_COMPLETE){
                $rslt = $task->update(['status'=>self::STATUS_DONE]);
                if(!$rslt){
                    return false;
                }
            }else{
                return true;
            }
            $taskId = $task->parent_id;
        }

        return true;
    }

    private function getSiblings($task){
        $siblingRows = $this->database->table(self::TABLE_TASKS)->where(['parent_id'=>$task->parent_id])->fetchAll();
        $siblings = array();
        foreach($siblingRows as $row){
            $siblings[] = $row->toArray();
        }

        return $siblings;
    }

    /**
     * @param task
     * This function returns true if all siblings have status complete, false otherwise
     * @return boolean */
    private function areSiblingsComplete($task){
        $siblings = $this->getSiblings($task);
        foreach($siblings as $sibling){
            if($sibling['status'] != self::STATUS_COMPLETE && $sibling['id'] != $task->id){
                return false;
            }
        }

        return true;
    }

    private function markDoneParentsComplete($task){
        $taskId = $task->id;
        $taskParentId = $task->parent_id;

        while($this->areSiblingsComplete($task) && $taskParentId){
            $taskParent = $this->getTaskById($taskParentId);
            if($taskParent->status == self::STATUS_DONE){
                $rslt = $taskParent->update(['status'=>self::STATUS_COMPLETE]);
                if(!$rslt){
                    return false;
                }
            }else{
                return true;
            }
            $task = $taskParent;
            $taskParentId = $taskParent->parent_id;
        }

        return true;
    }

    public function markInProgress($taskId){
        $task = $this->getTaskById($taskId);
        
        $this->database->beginTransaction();
        $taskResult = $task->update(['status'=>self::STATUS_IN_PROGRESS]);
        $parentsResult = $this->revertCompleteParentsToDone($task);

        if($taskResult && $parentsResult){
            $this->database->commit();
            return true;
        }else{
            $this->database->rollBack();
            return false;
        }
    }
    public function markDone($taskId){
        return $this->database->table(self::TABLE_TASKS)->get($taskId)->update(['status'=>self::STATUS_DONE]);
    }
    public function markComplete($taskId){
        $task = $this->getTaskById($taskId);

        $this->database->beginTransaction();
        $taskResult = $this->database->table(self::TABLE_TASKS)->get($taskId)->update(['status'=>self::STATUS_COMPLETE]);
        $parentsResult = $this->markDoneParentsComplete($task);

        if($taskResult && $parentsResult){
            $this->database->commit();
            return true;
        }else{
            $this->database->rollBack();
            return false;
        }
    }

    public function addTask($taskName, $parentId){
        if($parentId){
            // Validate that parent exist
            $parentTask = $this->getTaskById($parentId);
            if(!$parentTask){
                return array('result'=>false, 'msg'=>'<b>Task #'.$parentId.'</b> does not exist!<br/>Please choose a different <b>Parent ID</b>');
            }
        }

        $this->database->beginTransaction();
        $task = $this->database->table(self::TABLE_TASKS)->insert(['title'=>$taskName, 'status'=>self::STATUS_IN_PROGRESS, 'parent_id'=>$parentId]);
        if(!$task){
            $this->database->rollBack();
            $response = array('result'=>false, 'msg'=>'Something went wrong!');
        }else{
            $this->revertCompleteParentsToDone($task);
            $response = array('result'=>true);
        }

        $this->database->commit();
        return $response;
    }

    /**
     * Returns true if updating $task's parentId to $newParentId will cause circular dependancy, false otherwise
     * @return boolean */
    private function willCauseCircularDependancy($task, $newParentId){
        if($task->parent_id == $newParentId){ // Parent is not changed
            return false;
        }

        if($newParentId == 0){ // Become a Root task with no parent
            return false;
        }

        // check if new parent is a child of current task being edited
        $currentParentId = $newParentId;
        while($currentParentId != 0){
            if($currentParentId == $task->id){
                return true;
            }
            $currentParent = $this->getTaskById($currentParentId);
            $currentParentId = $currentParent->parent_id;
        }

        return false;
    }

    /**
     * The three Main procedures
     * 1- Validate that editing will cause no circular dependancy.
     * 2- Since we know we will edit. Before edit, call function markDoneParentsComplete
     * 3- After editing parent ID, if the task's status is not complete and parent is complete, revert parents to done.
     *
     * NOTE: if the tasks being edited has status complete, it will not affect any statuses in the task list. */
    public function editTask($taskId, $newTaskName, $newParentId){
        $task = $this->getTaskById($taskId);
        if(!$this->willCauseCircularDependancy($task, $newParentId)){ // Validate (procedure 1 -- Check comment above function)
            if($newParentId){
                // Validate that parent exists
                $parentTask = $this->getTaskById($newParentId);
                if(!$parentTask){
                    return array('result'=>false, 'msg'=>'Task with the new Parent ID does not exist!');
                }
            }

            $this->database->beginTransaction();
            if($task->status != self::STATUS_COMPLETE){ // Before edit procedure 2 -- Check comment above function
                $this->markDoneParentsComplete($task);
            }
            $task->update(['title'=>$newTaskName, 'parent_id'=>$newParentId]);
            if($task->status != self::STATUS_COMPLETE){ // After edit procedure 3 -- Check comment above function
                $this->revertCompleteParentsToDone($task);
            }
            $this->database->commit();

            $response = array('result'=>true);
        }else{
            $response = array('result'=>false, 'msg'=>'Cannot assign #'.$newParentId.' as Parent ID<br />This will cause circular dependancy!');
        }

        return $response;
    }
}