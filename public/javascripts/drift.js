$(function(){
    $('#regModal').on('hide.bs.modal',function(){
        var username = $('#username').val();
        if(username){
            var formData = new FormData();
            formData.append('username',username);
            formData.append('avatar',$('#avatar')[0].files[0]);
            $.ajax({
                url:"/users/add",
                type:"POST",
                data:formData,
                dataType:'json',
                processData:false,
                contentType:false
            }).done(function(ret){
                if(ret['code']==1){
                    var userInfo = ret['msg'];
                    $('#regBtnDiv').css('display','none');
                    $('#regInfoDiv').css('display','block');
                    $('#myUsername').text(userInfo.username);
                    $('#myAvatar').attr('src',userInfo.avatar);
                }
            });
        }
    })

});

function reg(){
    $('#regModal').modal('show');
}


function logout(){
    $.ajax({
        url:"/users/logout",
        type:"GET",
        dataType:'json'
    }).done(function(ret){
        if(ret['code']==1){
            var userInfo = ret['msg'];
            $('#regBtnDiv').css('display','block');
            $('#regInfoDiv').css('display','none');
            $('#myUsername').text('');
            $('#myAvatar').attr('src','');
        }
    });
}


function throwBottle(){
    if(parseInt($('#throwTimes').text())<=0){
        $('#msg').text('你今天扔瓶子的机会用完啦。。。');
        $('#msgModal').modal('show');
    }else{
        $('#content').val('');
        $('#throwModal').modal('show').css({
            "margin-top": function () {
                return 150;
            }
        });;
    }
}

$('#throwModal').on('hide.bs.modal',function(){
    var content = $('#content').val();
    if(content){
        $.ajax({
            url:"/bottle/throw",
            type:"POST",
            data:{content:content},
            dataType:'json'
        }).done(function(ret){
            if(ret['code']==1){
                $('#throwTimes').text(parseInt($('#throwTimes').text())-1);
                $('#msg').text(ret['msg']);
                $('#msgModal').modal('show');
            }else{
                $('#throwTimes').text(parseInt($('#throwTimes').text())-1);
                $('#msg').text(ret['msg']);
                $('#msgModal').modal('show');
            }
        });
    }
});