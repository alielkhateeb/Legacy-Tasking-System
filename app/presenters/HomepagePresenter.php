<?php

namespace App\Presenters;

use Nette;
use App\Model;
use App\Model\Task;
use Nette\Application\Responses\JsonResponse;

class HomepagePresenter extends BasePresenter
{
    /** @var \App\Model\Task  */
    private $task;

    /** @var Carries page tasks */
    private $tasks;

    /** @var Carries tasks status filters */
    private $statusFilter;

	public function __construct(Model\Task $task){
		$this->task = $task;
        $this->statusFilter = array($task::STATUS_IN_PROGRESS, $task::STATUS_DONE, $task::STATUS_COMPLETE); //All Statuses
	}

	public function renderDefault(){
        if(!isset($this->template->tasks)){
            $this->tasks = $this->task->getTasks($this->statusFilter);
            $this->template->tasks = $this->tasks;
        }
	}

    public function handleReloadTasks(){
        $this->redrawControl('allTasks');
    }

    public function handleMarkInProgress($taskId){
        $result = $this->task->markInProgress($taskId);
        $response = array('result'=>$result);
        $this->sendResponse(new JsonResponse($response));
    }

    public function handleMarkDone($taskId){
        $result = $this->task->markDone($taskId);
        $response = array('result'=>$result);
        $this->sendResponse(new JsonResponse($response));
    }

    public function handleMarkComplete($taskId){
        $result = $this->task->markComplete($taskId);
        $response = array('result'=>$result);
        $this->sendResponse(new JsonResponse($response));
    }

    public function handleFilterTasks(array $filter){
        $this->statusFilter = $filter;
        $this->redrawControl("allTasks");
    }

    public function handleAddTask($taskName, $taskParentID){
        $response = $this->task->addTask($taskName,$taskParentID);
        $this->sendResponse(new JsonResponse($response));
    }
}
