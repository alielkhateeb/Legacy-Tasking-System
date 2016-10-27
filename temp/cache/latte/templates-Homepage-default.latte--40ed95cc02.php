<?php
// source: C:\Users\ASG\Documents\nette-blog\app\presenters/templates/Homepage/default.latte

use Latte\Runtime as LR;

class Template40ed95cc02 extends Latte\Runtime\Template
{
	public $blocks = [
		'content' => 'blockContent',
		'title' => 'blockTitle',
	];

	public $blockTypes = [
		'content' => 'html',
		'title' => 'html',
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
		Nette\Bridges\ApplicationLatte\UIRuntime::initialize($this, $this->parentName, $this->blocks);
		
	}


	function blockContent($_args)
	{
		extract($_args);
?>
<div>
<?php
		$this->renderBlock('title', get_defined_vars());
?>
</div>
<?php
	}


	function blockTitle($_args)
	{
		extract($_args);
?>	<h1>Hello World!</h1>
<?php
	}

}
