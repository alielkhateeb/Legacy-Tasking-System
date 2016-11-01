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

    private function buildTree($tasks, $parentId=0, $depth=0){
        $branch = array();
        foreach($tasks as $task){
            if($task['parent_id'] == $parentId){
                $task['depth'] = $depth;
                $children = $this->buildTree($tasks, $task['id'], $depth+1);
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

    private function filterTasks(&$tasks, $filter){
        $filteredTasks = array();
        foreach($tasks as $task){
            if(in_array($task['status'], $filter)){
                $filteredTasks[] = $task;
            }
        }
        return $filteredTasks;
    }

    public function getTasks($filter=array(0,1,2)){
        $filterCommaSeparated = implode(',', $filter);
        $taskRows = $this->database->table(self::TABLE_TASKS)->order('id')->limit(20)->fetchAll();
        $tasks = array();
        foreach($taskRows as $taskRow){
            $tasks[] = $taskRow->toArray();
        }
        $tasks = $this->buildTree($tasks);
        if(count($filter) != 3){ // Not all statuses selected
            $tasks = $this->filterTasks($tasks, $filter);
        }

        return $tasks;
    }

    public function markInProgress($taskId){
        return $this->database->table(self::TABLE_TASKS)->where(['id'=>$taskId])->update(['status'=>self::STATUS_IN_PROGRESS]);
    }
    public function markDone($taskId){
        return $this->database->table(self::TABLE_TASKS)->where(['id'=>$taskId])->update(['status'=>self::STATUS_DONE]);
    }
    public function markComplete($taskId){
        return $this->database->table(self::TABLE_TASKS)->where(['id'=>$taskId])->update(['status'=>self::STATUS_COMPLETE]);
        // $this->updateParentStatus($taskId);
    }

    public function addTask($taskName, $parentId){
        $result = $this->database->table(self::TABLE_TASKS)->insert(['title'=>$taskName, 'status'=>self::STATUS_IN_PROGRESS, 'parent_id'=>$parentId]);
        if($result){
            $result = true;
        }
        return array('result'=>$result);
    }
}