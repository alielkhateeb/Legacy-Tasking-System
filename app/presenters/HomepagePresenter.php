<?php

namespace App\Presenters;

use Nette;
use App\Model;
use App\Model\Task;
use Nette\Application\UI\Control;
use Nette\Application\UI\Form;
use App\Presenters\templates\Components\TaskListItems;

class HomepagePresenter extends BasePresenter
{
    /** @var \App\Model\Task  */
    private $task;
    private $tasks;

	public function __construct(Model\Task $task){
		$this->task = $task;
	}

	public function renderDefault(){
		$this->tasks = $this->task->getAllTasks();
        $this->template->tasks = $this->tasks;
	}

    public function handleMarkDone($taskID){
        $this->task->markDone($taskID);
        return $this->redrawControl("allTasks");
    }

    public function handleMarkInProgress($taskID){
        $this->task->markInProgress($taskID);
        return $this->redrawControl("allTasks");
    }

}
