const TASK_STATUS_IN_PROGRESS=0;
const TASK_STATUS_DONE=1;
const TASK_STATUS_COMPLETE=2;

$(document).ready(function(){
    $.nette.init();
    $('.selectpicker').selectpicker('selectAll');

    // noty default options 
    $.noty.defaults = {
        layout: 'topCenter',
        theme: 'relax', // or 'relax'
        dismissQueue: true, // If you want to use queue feature set this true
        template: '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',
        animation: {
            open: "animated bounceInDown", // Animate.css class
            close: "animated bounceOutUp", // Animate.css class
        },
        timeout: "5000", // delay for closing event. Set false for sticky notifications
        force: false, // adds notification to the beginning of queue when set to true
        modal: false,
        maxVisible: 5, // you can set max visible notification for dismissQueue true option,
        killer: false, // for close all notifications before show
        closeWith: ['click'], // ['click', 'button', 'hover', 'backdrop'] // backdrop click will close all notifications
        callback: {
            onShow: function() {
                var notyListCount = $("#noty_topCenter_layout_container li").length;
                if(notyListCount >= 5){
                    var notycloseId = $("#noty_topCenter_layout_container>li:first-child>.noty_bar").attr('id');
                    $.noty.close(notycloseId);
                } 
            },
            afterShow: function() {},
            onClose: function() {},
            afterClose: function() {},
            onCloseClick: function() {},
        },
        buttons: false // an array of buttons
    };
});

function reloadTasks(){
    $.nette.ajax({url: '/\homepage/\?do=reloadTasks'});
}

$('.selectpicker').on('change', function(){
    var selected = $.map($('.filter-selected').find("option:selected"), function(option) { return option["value"]; });
    if(selected.length == 0){
        $('.filter').prop("disabled", true);
    }else{
        $('.filter').prop("disabled", false);
    }
});

$('.filter').on("click", function(e){
    var thisButton = $(this);
    thisButton.button('loading');
    var selected = $.map($('.filter-selected').find("option:selected"), function(o) { return o["value"]; });
    $.nette.ajax({
        url: "/\homepage/\?do=filterTasks",
        data: {filter: selected},
        success: function(){
            thisButton.button('reset');
        }
    });
});

$('.all-tasks').on('click', '.mark-in-progress', function(e){
    e.preventDefault();
    $(this).html('<i class="fa fa-circle-o-notch fa-spin">');
    taskSpan = $($(this).parents('.task'));
    var taskId = (taskSpan.data('id'));
    if(taskSpan.data('childrenCount') && taskSpan.data('status') == TASK_STATUS_COMPLETE){
        noty({text: "Couldn't mark Task <b>#"+taskId+" In Progress</b>!<br/>Cannot revert a <b>Complete</b> parent to <b>In Progress</b>", type:'warning'});
        $(this).html('<i class="fa fa-check-square-o fa-lg">');
        return;
    }
    $.nette.ajax({
        url: "/\homepage/\?do=markInProgress",
        data: {taskId: taskId},
        success: function(response){
            if(response.result){
                noty({text: "Task <b>#"+taskId+"</b> was marked <b>In Progress</b> successfully.", type:'success'})
                $(this).html('<i class="fa fa-square-o fa-lg">');
                reloadTasks();
            }else{
                noty({text: "Couldn't mark Task <b>#"+taskId+"</b> In Progress!", type:'error'})
                $(this).html('<i class="fa fa-check-square-o fa-lg">');
            }
        }
    });

});

$('.all-tasks').on('click', '.mark-done', function(e){
    e.preventDefault();
    $(this).html('<i class="fa fa-circle-o-notch fa-spin">');
    taskSpan = $($(this).parents('.task'));
    var taskId = (taskSpan.data('id'));
    var action = getAction(taskSpan); // If it has no children mark complete
    $.nette.ajax({
        url: "/\homepage/\?do="+action,
        data: {taskId: taskId},
        success: function(response){
            if(response.result){
                noty({text: "Task <b>#"+taskId+"</b> was marked <b>"+action.slice(4)+"</b> successfully.", type:'success'})
                $(this).html('<i class="fa fa-check-square-o fa-lg">');
                reloadTasks();
            }else{
                noty({text: "Couldn't mark Task <b>#"+taskId+" Done</b>!", type:'error'})
                $(this).html('<i class="fa fa-square-o fa-lg">');
            }
        }
    })
})

/** 
 * @param task <span>
 * @return string: 'markDone' or 'markComplete'
 * */
function getAction(taskSpan){
    if(taskSpan.data('childrenCount')){
        return (taskSpan.data('childrenCompleteCount') == taskSpan.data('childrenCount')) ? 'markComplete' : 'markDone';
    }else{
        return 'markComplete';
    }
}

$('#addTaskModal').on('change keyup', '.addTaskParentId', function(e){
    if($.trim($('.addTaskName').val())!=''){
        if(e.which==13){ // If pressed key was enter
            $('.addTaskModalConfirm').click();
        }    
    }
});

$('#addTaskModal').on('change keyup', '.addTaskName', function(e){
    if($.trim($(this).val())!=''){
        $('.addTaskModalConfirm').prop("disabled", false);
        if(e.which==13){ // If pressed key was enter
            $('.addTaskModalConfirm').click();
        }
    }else{
        $('.addTaskModalConfirm').prop("disabled", true);
    }
});

$('.addTaskModalConfirm').on('click', function(e){
    var taskName = $('.addTaskName').val();
    var taskParentId = $('.addTaskParentId').val();
    if($.trim(taskParentId)==''){
        taskParentId = 0;
    }

    var valid = validateAddTaskModal(taskName, taskParentId);
    if(!valid)return;

    $.nette.ajax({
        url: "/\homepage/\?do=addTask",
        data: {taskName: taskName, taskParentId: taskParentId},
        success: function(response){
            if(response.result){
                noty({text: "Task was added successfully.", type: 'success'});
                reloadTasks();
                $("#addTaskModal").modal("hide");
            }else{
                noty({text: response.msg, type: 'error'});
            }
        }
    });
});

$('#addTaskModal').on('shown.bs.modal', function(){
    $('.addTaskName').focus();
});

$('#addTaskModal').on('hide.bs.modal', function(){
    $('.addTaskModalConfirm').prop("disabled", true);
    $('.addTaskName').val('');
    $('.addTaskParentId').val('');
});

function validateAddTaskModal(taskName, taskParentId){
    if($.trim(taskName) == ''){
        noty({text: 'Cannot leave <b>Task Name</b> empty!', type: 'error'});
        $('.addTaskName').focus();
        return false;
    }
    if(isNaN(taskParentId)){
        noty({text: 'Please insert a valid number in <b>Parent ID</b>!', type: 'error'});
        $('.addTaskParentId').focus();
        return false;
    }
    if(taskParentId < 0){
        noty({text: '<b>Parent ID</b> cannot be negative!', type: 'error'});
        $('.addTaskParentId').focus();
        return false;
    }
    return true;
}

$("#editTaskModal").on('show.bs.modal', function(e){
    var taskId = $(e.relatedTarget).data('taskId');
    var taskName = $(e.relatedTarget).data('taskName');
    var taskParentId = $(e.relatedTarget).data('taskParentId');

    $(e.currentTarget).find('.editTaskName').val(taskName);
    $(e.currentTarget).find('.editTaskParentId').val(taskParentId);
    $(e.currentTarget).find('.editTaskModalConfirm').data('task-id', taskId);
    $(e.currentTarget).find('.modal-title').html('Edit Task <b>#'+taskId+'</b>');
});

$("#editTaskModal").on('shown.bs.modal', function(e){
    $('.editTaskName').focus();
});

function validateEditTaskModal(taskName, taskParentId){
    if($.trim(taskName) == ''){
        noty({text: 'Cannot leave <b>Task Name</b> empty!', type: 'error'});
        $('.editTaskName').focus();
        return false;
    }
    if(isNaN(taskParentId)){
        noty({text: 'Please insert a valid number in <b>Parent ID</b>!', type: 'error'});
        $('.editTaskParentId').focus();
        return false;
    }
    if(taskParentId < 0){
        noty({text: '<b>Parent ID</b> cannot be negative!', type: 'error'});
        $('.editTaskParentId').focus();
        return false;
    }
    return true;
}

$('#editTaskModal').on('change keyup', '.editTaskParentId', function(e){
    if($.trim($('.editTaskName').val())!=''){
        $('.editTaskModalConfirm').prop("disabled", false);
        if(e.which==13){ // If pressed key was enter
            $('.editTaskModalConfirm').click();
        }    
    }
});

$('#editTaskModal').on('change keyup', '.editTaskName', function(e){
    if($.trim($(this).val())!=''){
        $('.editTaskModalConfirm').prop("disabled", false);
        if(e.which==13){ // If pressed key was enter
            $('.editTaskModalConfirm').click();
        }
    }else{
        $('.editTaskModalConfirm').prop("disabled", true);
    }
});

$('.editTaskModalConfirm').on('click', function(e){
    var taskName = $('.editTaskName').val();
    var taskParentId = $('.editTaskParentId').val();
    var taskId = $(this).data('taskId');
    if($.trim(taskParentId)==''){
        taskParentId = 0;
    }
    if(taskId == taskParentId){
        noty({text: "Task ID and Parent ID cannot be equal (#"+taskId+").<br />This will cause circular dependancy!", type: 'error'});
        $('.editTaskParentId').focus();
        return;
    }

    var valid = validateEditTaskModal(taskName, taskParentId);
    if(!valid)return;

    $.nette.ajax({
        url: "/\homepage/\?do=editTask",
        data: {taskId: taskId, taskName: taskName, taskParentId: taskParentId},
        success: function(response){
            if(response.result){
                noty({text: "<b>Task #"+taskId+"</b> was edited successfully.", type: 'success'});
                reloadTasks();
                $("#editTaskModal").modal("hide");
            }else{
                noty({text: response.msg, type: 'error'});
            }
        }
    });
});

