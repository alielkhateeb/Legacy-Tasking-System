<?php
// source: C:\Users\ASG\Documents\Legacy-Tasking-System\app\presenters/templates/Homepage/default.latte

use Latte\Runtime as LR;

class Template343b303018 extends Latte\Runtime\Template
{
	public $blocks = [
		'content' => 'blockContent',
	];

	public $blockTypes = [
		'content' => 'html',
	];


	function main()
	{
		extract($this->params);
		if ($this->getParentName()) return get_defined_vars();
		$this->renderBlock('content', get_defined_vars());
		return get_defined_vars();
	}


	function prepare()
	{
		extract($this->params);
		if (isset($this->params['task'])) trigger_error('Variable $task overwritten in foreach on line 19');
		Nette\Bridges\ApplicationLatte\UIRuntime::initialize($this, $this->parentName, $this->blocks);
		
	}


	function blockContent($_args)
	{
		extract($_args);
?>
  <body>
    <div class="container">
      <div class="page-header">
        <h1>Legacy Tasking System</h1>
      </div>

	  <table class="table table-bordered table-hover">
		  <thead>
			  <tr>
				  <th>ID</th>
				  <th>Title</th>
				  <th>Status</th>
				  <th>Parent ID</th>
				  <th></th>
			  </tr>
		  </thead>
		  <tbody>
<?php
		$iterations = 0;
		foreach ($tasks as $task) {
?>
			  <tr>
			  	<td><?php echo LR\Filters::escapeHtmlText($task->id) /* line 21 */ ?></td>
			  	<td><?php echo LR\Filters::escapeHtmlText($task->title) /* line 22 */ ?></td>
			  	<td><?php echo LR\Filters::escapeHtmlText($task->status) /* line 23 */ ?></td>
			  	<td><?php echo LR\Filters::escapeHtmlText($task->parent_id) /* line 24 */ ?></td>
			  	<td></td>
			  </tr>
<?php
			$iterations++;
		}
?>
		  </tbody>
	  </table>
	  

    </div>
  </body>
<?php
	}

}
