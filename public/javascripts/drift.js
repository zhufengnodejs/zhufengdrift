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


function pick(){
    if(parseInt($('#pickTimes').text())<=0){
        $('#msg').text('你今天捞瓶子的机会用完啦。。。。');
        $('#msgModal').modal('show');
    }else{
        $.ajax({
            url:"/bottle/pick",
            type:"POST",
            dataType:'json'
        }).done(function(ret){
            if(ret['code']==1){
                var bottle = ret['msg'];
                $('#pickTimes').text(parseInt($('#pickTimes').text())-1);
                $("#owner").val(bottle.username);
                $("#showOwner").html(bottle.username);
                $("#bottle_content").val(bottle.content);
                $("#showBottle_content").html(bottle.content);
                $("#time").val(bottle.time);
                $("#showTime").html(new Date(parseInt(bottle.time)).toLocaleString());
                $('#pickModal').modal('show');
            }else{
                $('#pickTimes').text(parseInt($('#pickTimes').text())-1);
                $('#msg').text(ret['msg']);
                $('#msgModal').modal('show');
            }
        });
    }
}



function throwback(){
    var owner = $('#owner').val();
    var time = $('#time').val();
    var bottle_content = $('#bottle_content').val();
    if(bottle_content){
        $.ajax({
            url:"/bottle/throw",
            type:"POST",
            data:{content:bottle_content,owner:owner,time:time},
            dataType:'json'
        }).done(function(ret){
            if(ret['code']==1){
                $('#pickModal').modal('hide');
                $('#throwTimes').text(parseInt($('#throwTimes').text()));
                $('#msg').text(ret['msg']);
                $('#msgModal').modal();
            }else{
                $('#pickModal').modal('hide');
                $('#msg').text(ret['msg']);
                $('#msgModal').modal();
            }
        });
    }
}


function response(){
    var owner = $('#owner').val();
    var time = $('#time').val();
    var response = $('#response').val();
    var bottle_content = $('#bottle_content').val();
    if(bottle_content){
        $.ajax({
            url:"/bottle/response",
            type:"POST",
            data:{response:response,content:bottle_content,owner:owner,time:time},
            dataType:'json'
        }).done(function(ret){
            if(ret['code']==1){
                $('#pickModal').modal('hide');
                $('#msg').text('回应成功,瓶子已经收藏到了我的瓶子里了。');
                $('#msgModal').modal();
            }else{
                $('#pickModal').modal('hide');
                $('#msg').text(ret['msg']);
                $('#msgModal').modal();
            }
        });
    }
}



function myBottle(){
    $.ajax({
        url:"/bottle/myBottle",
        type:"POST",
        dataType:'json'
    }).done(function(ret){
        if(ret['code']==1){
            var bottles = ret['msg'];
            $('#myBottleRows').empty();
            for(var i=0;i<bottles.length;i++){
                $('#myBottleRows').append(
                    $('<div class="col-sm-12"><a href="#" onclick="viewBottle(&quot;'+bottles[i]._id+'&quot;)"'+'>'
                    +(bottles[i].message[0].user+":"+bottles[i].message[0].content)
                    +'</a></div>')
                );
            }
            $('#myBottleModal').modal('show');
        }else{
            $('#msg').text(ret['msg']);
            $('#msgModal').modal();
        }
    });
}



function viewBottle(bottleId){
    $.ajax({
        url:"/bottle/pick",
        type:"POST",
        data:{bottleId:bottleId},
        dataType:'json'
    }).done(function(ret){
        if(ret['code']==1){
            var bottle = ret['msg'];
            $('#viewBottleRows').empty();
            for(var i=0;i<bottle.message.length;i++){
                $('#viewBottleRows').append(
                    $('<div class="col-sm-12">'
                    +(bottle.message[i].user+":"+bottle.message[i].content)
                    +'</div>')
                );
            }
            $('#myBottleModal').modal('hide');
            $('#viewBottleModal').modal('show');
        }else{
            $('#msg').text(ret['msg']);
            $('#msgModal').modal();
        }
    });
}
