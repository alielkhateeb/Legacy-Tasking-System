<?php

namespace App\Model;

use Nette;
use Nette\Database\Context;

class Task extends Nette\Object{
    const TABLE_TASKS = 'tasks';

    /** @var Nette\Database\Context */
    private $database;

    public function __construct(Nette\Database\Context $database){
        $this->database = $database;
    }

    private function buildTree($tasks, $parentID=0, $depth=0){
        $branch = array();
        foreach($tasks as $task){
            if($task['parent_id'] == $parentID){
                $task['depth'] = $depth;
                $children = $this->buildTree($tasks, $task['id'], $depth+1);
                $task['childrenCount'] = count($children);
                $branch[] = $task;
                if($children){
                    foreach($children as $child){
                        $branch[] = $child;
                    }
                }
            }
        }
        return $branch;
    }

    public function getAllTasks(){
        $taskRows = $this->database->table(self::TABLE_TASKS)->order('id')->limit(20)->fetchAll();
        foreach($taskRows as $taskRow){
            $tasks[] = $taskRow->toArray();
        }
        // echo "<pre>";
        // print_r($this->buildTree($tasks));
        // echo "</pre>";
        // die;
        return $this->buildTree($tasks);
    }

    private function markComplete($taskId){
        $this->database->table(self::TABLE_TASKS)->where(['id'=>$taskId])->update(['status'=>2]);
    }
    public function markDone($taskId){
        $this->database->table(self::TABLE_TASKS)->where(['id'=>$taskId])->update(['status'=>1]);
    }
    public function markInProgress($taskId){
        $this->database->table(self::TABLE_TASKS)->where(['id'=>$taskId])->update(['status'=>0]);
    }
}