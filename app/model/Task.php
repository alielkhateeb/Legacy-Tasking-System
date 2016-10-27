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

    public function getAllTasks(){
        return $this->database->table(self::TABLE_TASKS)->order('id')->limit(20)->fetchAll();
    }
}