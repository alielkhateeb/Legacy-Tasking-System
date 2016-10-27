<?php

namespace App\Presenters;

use Nette;
use App\Model;
use App\Model\Task;

class HomepagePresenter extends BasePresenter
{
    /** @var \App\Model\Task  */
    private $task;

	public function __construct(Model\Task $task){
		$this->task = $task;
	}

	public function renderDefault()
	{
		$this->template->tasks = $this->task->getAllTasks();
	}

}
