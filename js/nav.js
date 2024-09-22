$(document).ready(function() {
    var translateElement = $('<div>', { id: 'google_translate_element' });
    $('.nav-item #userStatus').parent().before(translateElement);

    // 动态加载Google Translate脚本
    /*var googleTranslateScript = document.createElement('script');
    googleTranslateScript.type = 'text/javascript';
    googleTranslateScript.async = true;
    googleTranslateScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    
    // 设置一个标记，用于检查脚本是否成功加载
    var scriptLoaded = false;
    
    // 设置一个计时器，5秒后检查脚本是否加载
    setTimeout(function() {
        if (!scriptLoaded) {
            // 如果脚本未加载，从文档中移除该脚本节点
            document.body.removeChild(googleTranslateScript);
            console.log('Google Translate script loading aborted due to timeout.');
        }
    }, 5000); // 5秒后执行

    // 监听脚本加载事件
    googleTranslateScript.onload = function() {
        scriptLoaded = true;
        console.log('Google Translate script loaded successfully.');
    };

    // 监听脚本加载失败事件
    googleTranslateScript.onerror = function() {
        scriptLoaded = true; // 将标记设置为true，即使加载失败也不再尝试移除脚本
        console.log('Failed to load the Google Translate script.');
    };

    document.body.appendChild(googleTranslateScript);*/
  var loggedIn = sessionStorage.getItem('loggedIn');
  var expiration = sessionStorage.getItem('expiration');
  var now = new Date();

  if (loggedIn && expiration && now.getTime() < expiration) {
    var logoutButton = document.getElementById('logoutButton');
    
    // 移除"btn-danger"类
    logoutButton.classList.remove('btn-danger');
    
    // 设置按钮颜色
    logoutButton.style.color = 'rgba(255, 255, 255, .5)';
    logoutButton.style.border = '1px solid rgba(255, 255, 255, .5)';
    var username = sessionStorage.getItem('username');
    updateLoginStatus();
            checkUnreadMessages();
        setInterval(checkUnreadMessages(), 30);
        // 模态框显示时加载消息
$('#messagesModal').on('show.bs.modal', function(e) {
    var modalBody = $(this).find('.modal-body');
    modalBody.prepend('<div id="loading"><div class="loader"></div></div>'); 
    fetchMessages().then(function(data) {
        $('#loading').remove(); // 移除加载动画
        if (data.success) {
            buildConversationsList(data);
        } else {
            console.error('获取消息失败');
        }
        checkUnreadMessages();
        setInterval(checkUnreadMessages(), 30);
    }).catch(function(error) {
        $('#loading').remove(); // 确保即使发生错误也要移除加载动画
        console.error(error.message);
    });
});  } else {
    logout(); // 如果过期或未登录，执行注销操作
    
  }
    updateButtonForRemainingTime();
$('nav .fas.fa-envelope').css('color', 'rgba(255, 255, 255, .5)');
    // 绑定登录表单提交事件处理器
    $('#loginModal').submit(function(event) {
        event.preventDefault(); // 阻止表单默认提交行为

        // 获取输入的用户名和密码
        var username = $('#username').val();
        var password = $('#password').val();

        // 发送AJAX请求到服务器进行验证
        $.ajax({
            type: 'POST',
            url: 'login.php', // 您的登录处理脚本
            data: { username: username, password: password },
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    // 登录成功
                    var now = new Date();
                    var expiration = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 设置7天后的时间
                    sessionStorage.setItem('loggedIn', true); // 存储登录状态
                    sessionStorage.setItem('username', response.real_username); // 存储用户名
                    sessionStorage.setItem('expiration', expiration.getTime()); // 存储过期时间戳
                    sessionStorage.setItem('email', response.email); // 存储email
                    sessionStorage.setItem('token', response.token);
                    sessionStorage.setItem('id', response.id);
                    $('[data-target="#loginModal"]').hide();
                    $('[data-target="#registerModal"]').hide();
                    var logoutButton = document.getElementById('logoutButton');
                    
                    // 移除"btn-danger"类
                    logoutButton.classList.remove('btn-danger');
                    
                    // 设置按钮颜色
                    logoutButton.style.color = 'rgba(255, 255, 255, .5)';
                    logoutButton.style.border = '1px solid rgba(255, 255, 255, .5)';
                    $('.logoutControl').show();
                    $('a[href="center.html"]').hide();
                    $('a[href="calculate.html"]').hide();
                    $('a[href="CStore.html"]').hide();

                    $('#loginModal').modal('hide').on('hidden.bs.modal', function() {
                        // 这里的代码会在模态框完全关闭后执行
                        $('.modal-backdrop').remove(); // 如果需要的话，手动移除遮罩
                    });

                    updateLoginStatus(); // 更新页面显示登录状态
                } else {
                    // 登录失败，显示错误信息
                    alert('登录失败: ' + response.message);
                }
            },
            error: function() {
                alert('登录请求失败，请稍后再试。');
                $('#refreshAlert').show();
            }
        });
    });
    // 页面加载时检查登录状态
    checkLoginStatus();
    updateButtonForRemainingTime();

    // 点击站内信图标时打开模态框并加载消息
    $('#messagesDropdown').on('click', function() {
        $('#messagesModal').modal('show'); // 显示模态框
    });
// 绑定发送按钮的点击事件
$('#sendMessage').on('click', function() {
    sendMessage();
});



    // 注册表单提交事件
    $('#registerModal').submit(function(event) {
        event.preventDefault(); // 阻止表单默认提交行为
        registerUser();
    });

    // 发送验证码按钮点击事件
    $('#sendVerificationCode').on('click', function() {
        sendVerificationCode();
    });

    // 注销按钮点击事件
    $('#logoutButton').on('click', function() {
        logout();
    });
  
    $("#footer-placeholder").load("footer.html");
    
});
function googleTranslateElementInit() {
  new google.translate.TranslateElement({pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE}, 'google_translate_element');
}

function checkUnreadMessages() {
    
    var token = sessionStorage.getItem('token');
    var id = sessionStorage.getItem('id');
    $.ajax({
            type: 'POST',
            url: 'chkmsg.php',
            data: { token: token, uid:id },
            dataType: 'json',
            success: function(response) {
                if (response.unreadCount > 0) {
                $('#unreadMessagesCount').text(response.unreadCount).show();
                // 更改图标颜色为红色
                $('nav .fas.fa-envelope').css('color', 'red');
            } else {
                $('#unreadMessagesCount').hide();
                // 没有未读消息时，恢复图标原始颜色
                $('nav .fas.fa-envelope').css('color', 'rgba(255, 255, 255, .5)');
            }},
            error: function() {
                $('#emailHelp').hide();
                console.log('请求未读消息数量失败');
            }
    });
}
// 更新页面显示登录状态的函数

// 检查登录状态
function checkLoginStatus() {
    var loggedIn = sessionStorage.getItem('loggedIn');
    var expiration = sessionStorage.getItem('expiration');
    var now = new Date();

    if (loggedIn && expiration && now.getTime() < expiration) {
        updateLoginStatus();
    } else {
        logout(); // 如果过期或未登录，执行注销操作
    }
}

// 注销函数
function logout() {
    sessionStorage.clear();
    updateLoginStatus(); // 更新UI为未登录状态

}
function updateLoginStatus() {
    var username = sessionStorage.getItem('username');
    if (username) {
        // 根据您的页面结构，这里可能需要调整
        $('#userStatus').text('Welcome, ' + username);
        $('a[href="calculate.html"]').show();
        // 显示注销按钮，隐藏登录按钮
        $('#logoutButton').show();
        $('a[href="center.html"]').show();
        $('a[href="calculate.html"]').show();
        $('a[href="CStore.html"]').show();
        $('.logoutControl').show();
        $('#loginButton').hide();
        $('[data-target="#loginModal"]').hide();
        $('[data-target="#registerModal"]').hide();
    } else {
        $('.logoutControl').hide();
        $('#userStatus').text('Please login or register:');
        $('#loginButton').show();
        $('[data-target="#loginModal"]').show();
        $('[data-target="#registerModal"]').show();
        $('#logoutButton').hide();
        $('a[href="center.html"]').hide();
        $('a[href="calculate.html"]').hide();
        $('a[href="CStore.html"]').hide();
    }
}

// 注册用户
function registerUser() {
    // 获取表单数据
    var regusername = $('#regusername').val();
    var email = $('#email').val();
    var regpassword = $('#regpassword').val();
    var verificationCode = $('#verificationCode').val();

    // 发送AJAX请求到服务器进行注册
    $.ajax({
        type: 'POST',
        url: 'register.php', // 您的注册处理脚本
        data: {
            email: email,
            regusername: regusername,
            regpassword: regpassword,
            verificationCode: verificationCode
        },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                // 注册成功
                $('#registerModal').modal('hide'); // 关闭模态框
                alert('注册成功！Register success!');
            } else {
                // 注册失败，显示错误信息
                $('#registerError').show().text('连接不稳定，请尝试直接登录! Connection unstable, please try to sign in directly!');
            }
        },
        error: function() {
            alert('注册请求失败，请稍后再试。Register request failed, please try later.');
            $('#refreshAlert').show();
        }
    });
}

// 发送验证码
function sendVerificationCode() {
    var allFilled = true;
    $('.required-input').each(function() {
        if ($(this).val() === '') {
            allFilled = false;
            // 可以在这里为对应的输入框添加一些视觉提示，例如边框颜色变红
            $(this).css('border-color', 'red'); // 举例：将未填写的输入框边框设为红色
        } else {
            $(this).css('border-color', ''); // 已填写的输入框恢复原样
        }
    });

    // 如果有未填写的必填输入框，显示提示信息并终止函数执行
    if (!allFilled) {
        alert('请填写所有必填信息后再发送验证码。');
        return; // 终止函数执行
    }
    // 记录发送时间到localStorage
    const now = Date.now();
    localStorage.setItem('lastSentTime', now.toString());

    // 获取用户输入的邮箱并发送验证码...
    var email = $('#email').val();
    if (email) {
        $.ajax({
            type: 'POST',
            url: 'sendVerificationCode.php',
            data: { email: email },
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    $('#emailHelp').show();
                    // 禁用发送按钮，60秒后再启用
                    const now = Date.now();
                    localStorage.setItem('lastSentTime', now.toString());
                    $('#sendVerificationCode').prop('disabled', true);
                    updateButtonForRemainingTime();
                    
                } else {
                    $('#emailHelp').hide();
                    alert('验证码发送失败: ' + response.error);
                }
            },
            error: function() {
                $('#emailHelp').hide();
                alert('请求发送验证码失败，请稍后再试。');
            }
        });
    } else {
        alert('请输入邮箱地址。');
    }
}

function updateButtonForRemainingTime() {
    const now = Date.now();
    const lastSentTime = localStorage.getItem('lastSentTime') ? parseInt(localStorage.getItem('lastSentTime'), 10) : 0;
    let remainingTime = 60000 - (now - lastSentTime);

    remainingTime = Math.max(0, remainingTime);

    if (remainingTime > 0) {
        $('#sendVerificationCode').text(`请等待${Math.ceil(remainingTime / 1000)}秒`);
        $('#sendVerificationCode').prop('disabled', true);
        // 使用setTimeout来延迟下一次调用，无需清除定时器
        setTimeout(updateButtonForRemainingTime, 1000);
    } else {
        $('#sendVerificationCode').text('发送验证码');
        $('#sendVerificationCode').prop('disabled', false);
    }
}
// 获取消息
function fetchMessages() {
    return new Promise((resolve, reject) => {
        var receiverId = sessionStorage.getItem('id');
        var token = sessionStorage.getItem('token');
        $.ajax({
            type: 'POST',
            url: 'getmsg.php',
            data: JSON.stringify({ receiver_id: receiverId, token: token}),
            contentType: 'application/json',
            success: function(data) {
                console.log(data);
                resolve(data);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('无法加载消息');
                reject(new Error('加载消息时发生错误'));
            }
        });
    });
}


function buildConversationsList(data) {
    var conversations = {};
    var userId = sessionStorage.getItem('id'); // 假设当前用户ID已存储在sessionStorage

    data.messages.forEach(function(message) {
        // 对话标识可以是两个用户ID的组合，这里简单地将它们连接起来
        var conversationId = [message.sender_id, message.receiver_id].sort().join('-');

        if (!conversations[conversationId]) {
            conversations[conversationId] = {
                participants: [message.sender_id, message.receiver_id],
                messages: []
            };
        }
        conversations[conversationId].messages.push(message);
    });

    var conversationList = $('#conversationList');
    conversationList.empty(); // 清空现有列表

Object.values(conversations).forEach(function(conversation) {
        var partnerId = conversation.participants.find(id => id !== userId);
        //var listItem = $('<div></div>').addClass('conversation-item').text('对话 ' + partnerId);
        var listItem = $('<div></div>').addClass('conversation-item').text('CarbonTrack User-Service');
        listItem.css({
            'margin-bottom': '10px', // 增加底部外边距
            'padding': '10px', // 增加内边距
            'border': '1px solid #ccc', // 可选：添加边框以更好地区分
            'border-radius': '5px' // 可选：添加圆角
        });
        listItem.on('click', function() {
            displayMessages(conversation.messages, partnerId);
        });
        conversationList.append(listItem);
    });}


function displayMessages(messages,sender) {
    sessionStorage.setItem('currentChatPartnerId', sender); // 将当前聊天伙伴的sender_id保存在sessionStorage中
    const messagesContainer = document.getElementById('messageList');
    messagesContainer.innerHTML = ''; // 清空现有消息

    messages.forEach((message, index) => {
        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble');
var currentUserId = sessionStorage.getItem('id');

// 根据消息发送者和接收者，调整气泡样式
if (message.sender_id === currentUserId) {
    messageBubble.classList.add('sent');
} else {
    messageBubble.classList.add('received');
}

        messageBubble.innerHTML = `<p>${message.content}</p>`;

        // 添加已读状态标记
        const readStatus = document.createElement('span');
        readStatus.classList.add('read-status');
        if (message.is_read) {
            readStatus.classList.add('read');
            readStatus.textContent = '已读Read';
        } else {
            readStatus.classList.add('unread');
            readStatus.textContent = '未读Unread';
        }

        messageBubble.appendChild(readStatus);
        messagesContainer.appendChild(messageBubble);

        // 触发动画
        setTimeout(() => {
            messageBubble.style.opacity = 1;
            messageBubble.style.transform = 'translateY(0)';
        }, 100 * index); // 为每个消息设置不同的延时，创建“逐个出现”的效果
    });
}
function sendMessage() {
    var receiverId = sessionStorage.getItem('currentChatPartnerId');  // 假设你有一个接收者ID的输入字段
    var messageContent = $('#messageInput').val(); // 获取消息输入框的内容
    var senderId = sessionStorage.getItem('id'); // 假设在登录时，你已经将用户ID保存在了sessionStorage中
    var token = sessionStorage.getItem('token'); // 获取保存的token

    if (messageContent.trim() === '') {
        alert('消息内容不能为空！');
        return;
    }

    $.ajax({
        type: 'POST',
        url: 'sendmsg.php', // 你的后端处理脚本路径
        contentType: 'application/json',
        data: JSON.stringify({
            sender_id: senderId,
            receiver_id: receiverId,
            content: messageContent,
            token: token
        }),
        success: function(response) {
            if (response.success) {
                alert('消息发送成功！');
                $('#messageInput').val(''); // 清空输入框
                // 可选：更新消息列表
            } else {
                alert('消息发送失败: ' + response.message);
            }
        },
        error: function() {
            alert('消息发送请求失败，请稍后再试。');
        }
    });
}





