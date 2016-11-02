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
        url: "/\www/\homepage/\?do=editTask",
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

$("#editTaskModal").on('show.bs.modal', function(e){
    var taskId = $(e.relatedTarget).data('taskId');
    var taskName = $(e.relatedTarget).data('taskName');
    var taskParentId = $(e.relatedTarget).data('taskParentId');

    $(e.currentTarget).find('.editTaskName').val(taskName);
    if(taskParentId){
        $(e.currentTarget).find('.editTaskParentId').val(taskParentId);
    }
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
