  var dockContainer = document.getElementById('dock-container');
  var dock = document.getElementById('dock');
  var expandDock = document.getElementById('expand-dock');
  var addAppButton = document.querySelector('.add-app');
  var addAppModal = document.getElementById('addAppModal');
  var closeAddAppModal = document.querySelector('#addAppModal .close');
  var appForm = document.getElementById('appForm');
  var customDialog = document.getElementById('customDialog');
  var confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  var cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  var appToDelete = null;

  var isDockOpen = false; // 默认关闭状态

  // 修改从本地存储中获取状态的逻辑
  var dockStatus = localStorage.getItem('dockStatus');
  if (dockStatus === null) {
    // 如果是首次访问(没有存储状态)，设置为关闭状态
    dockContainer.style.left = '-1000px';
    expandDock.style.display = 'block';
    localStorage.setItem('dockStatus', 'closed');
  } else if (dockStatus === 'open') {
    dockContainer.style.left = '50%';
    expandDock.style.display = 'none';
    isDockOpen = true;
  } else if (dockStatus === 'closed') {
    dockContainer.style.left = '-1000px';
    expandDock.style.display = 'block';
  }

  dock.addEventListener('click', function(event) {
    if (event.target.classList.contains('close-dock')) {
      dockContainer.style.left = '-1000px';
      expandDock.style.display = 'block';
      isDockOpen = false;
      localStorage.setItem('dockStatus', 'closed');
    } else if (event.target.classList.contains('add-app')) {
      addAppModal.style.display = 'block';
    }
  });

  expandDock.addEventListener('click', function() {
    dockContainer.style.left = '50%';
    expandDock.style.display = 'none';
    isDockOpen = true;
    localStorage.setItem('dockStatus', 'open');
  });

  window.onclick = function(event) {
    if (event.target == addAppModal) {
      addAppModal.style.display = 'none';
    }
  };

  closeAddAppModal.onclick = function() {
    addAppModal.style.display = 'none';
  };

  // 加载用户添加的应用图标
  function loadUserApps() {
    var userApps = JSON.parse(localStorage.getItem('userApps')) || [];
    var dockIcons = document.querySelector('.dock-icons');
    
    userApps.forEach(function(app) {
      var newAppIcon = createAppIconElement(app);
      dockIcons.insertBefore(newAppIcon, dockIcons.firstChild);
    });
  }

// 创建新的应用图标元素
function createAppIconElement(app) {
  var newAppIcon = document.createElement('li');
  newAppIcon.className = 'dock-icon';
  var newAppLink = document.createElement('a');
  newAppLink.href = app.url;
  newAppLink.target = '_blank'; // 打开新标签页
  var newAppImg = document.createElement('img');
  newAppImg.src = app.icon;
  newAppImg.alt = app.name;
  var newAppTooltip = document.createElement('span');
  newAppTooltip.className = 'docktooltip';
  newAppTooltip.textContent = app.name;

  // 设置应用图标的 data-app-id 属性
  newAppIcon.dataset.appId = app.id;

  newAppLink.appendChild(newAppImg);
  newAppLink.appendChild(newAppTooltip);
  newAppIcon.appendChild(newAppLink);

  // 为新的应用图标添加右键点击事件处理程序
  addContextMenuListener(newAppIcon);

  return newAppIcon;
}

  // 保存用户添加的应用图标
  function saveUserApps(userApps) {
    localStorage.setItem('userApps', JSON.stringify(userApps));
  }

// 添加新应用后的处理
function handleNewAppAdded(appUrl, appName, appIcon) {
  var userApps = JSON.parse(localStorage.getItem('userApps')) || [];
  
  // 检查是否已达到最大添加数量
  if (userApps.length >= 16) {
    alert("塞不下啦~，先在图标上右键删掉一些吧");
    return; // 退出函数，不继续添加新内容
  }
  
  var uniqueId = Date.now(); // 生成唯一标识符，例如使用时间戳
  var iconUrl;

  // 检查用户是否填写了图标链接
  if (!appIcon) {
    iconUrl = `https://t3.gstatic.cn/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=128&url=${encodeURIComponent(appUrl)}`;
  } else {
    iconUrl = appIcon;
  }

  // 添加新应用，并将唯一标识符作为索引
  userApps.push({ id: uniqueId, url: appUrl, name: appName, icon: iconUrl });
  // 更新本地存储中的用户应用数据
  saveUserApps(userApps);

  // 更新界面显示
  var dockIcons = document.querySelector('.dock-icons');
  var newAppIcon = createAppIconElement({ id: uniqueId, url: appUrl, name: appName, icon: iconUrl });
  // 将新应用插入到导航栏的顶部位置
  dockIcons.insertBefore(newAppIcon, dockIcons.firstChild);

  // 给新的应用图标重新绑定右键点击事件处理程序
  addContextMenuListener(newAppIcon);
}


// 加载用户添加的应用图标
function loadUserApps() {
  var userApps = JSON.parse(localStorage.getItem('userApps')) || [];
  var dockIcons = document.querySelector('.dock-icons');
  
  // 根据唯一标识符，将新应用插入到导航栏的顶部位置
  userApps.forEach(function(app) {
    var newAppIcon = createAppIconElement(app);
    dockIcons.insertBefore(newAppIcon, dockIcons.firstChild);
  });
}



  // 函数：为应用图标添加右键点击事件处理程序
  function addContextMenuListener(appIcon) {
    appIcon.addEventListener('contextmenu', function(event) {
      event.preventDefault(); // 阻止默认右键菜单
      appToDelete = appIcon;
      customDialog.style.display = 'block'; // 显示自定义对话框
    });
  }

  // 事件处理
  document.addEventListener('DOMContentLoaded', function() {
    var appForm = document.getElementById('appForm');
    var addAppModal = document.getElementById('addAppModal');
    var appUrlInput = document.getElementById('appUrl');
    var appIconInput = document.getElementById('appIcon');

    // 加载用户添加的应用图标
    loadUserApps();

    // 添加应用表单提交事件
    appForm.addEventListener('submit', function(event) {
      event.preventDefault(); // 阻止表单的默认提交行为
      var appUrl = appUrlInput.value.trim(); // 移除两端的空白字符
      var appName = document.getElementById('appName').value.trim(); // 移除两端的空白字符
      var appIcon = appIconInput.value.trim(); // 移除两端的空白字符

      // 输入验证
      if (!isValidUrl(appUrl)) {
        alert("请输入有效的网址链接！");
        return;
      }

      // 创建新的应用图标
      var newAppIcon = createAppIconElement({ url: appUrl, name: appName, icon: appIcon });
      var dockIcons = document.querySelector('.dock-icons');

      // 处理新应用添加
      handleNewAppAdded(appUrl, appName, appIcon);

      // 关闭模态框
      addAppModal.style.display = 'none';

      // 清空表单
      appForm.reset();
    });

    // 输入验证函数
    function isValidUrl(url) {
      var urlPattern = /^(http|https):\/\/[^ "]+$/;
      return urlPattern.test(url);
    }
  });

// 点击确认删除按钮
confirmDeleteBtn.addEventListener('click', function() {
  if (appToDelete) {
    var userApps = JSON.parse(localStorage.getItem('userApps')) || [];
    var appId = appToDelete.dataset.appId; // 获取待删除应用的 id
    var index = userApps.findIndex(function(app) {
      return app.id == appId;
    });

    if (index !== -1) {
      // 从用户应用数据中删除对应的应用
      userApps.splice(index, 1);

      // 更新本地存储中的用户应用数据
      saveUserApps(userApps);

      // 添加日志以跟踪删除后的用户应用数据
      console.log('删除后的应用列表：', userApps);

      appToDelete.remove(); // 删除应用图标
      appToDelete = null; // 重置待删除的应用图标
    }
  }
  customDialog.style.display = 'none'; // 隐藏自定义对话框
});


  // 点击取消删除按钮或者对话框之外的区域关闭自定义对话框
  window.addEventListener('click', function(event) {
    if (event.target === cancelDeleteBtn || (event.target !== customDialog && !customDialog.contains(event.target))) {
      customDialog.style.display = 'none';
      appToDelete = null; // 重置待删除的应用图标
    }
  });
  
// 更新或检查分割线的显示状态
function updateDockDividerVisibility() {
  var userApps = JSON.parse(localStorage.getItem('userApps')) || [];
  var dockDivider = document.getElementById('dock-divider');
  if (userApps.length > 0) {
    // 如果有用户添加的内容，显示分割线
    dockDivider.style.display = 'block';
  } else {
    // 如果没有用户添加的内容，隐藏分割线
    dockDivider.style.display = 'none';
  }
}

// 在loadUserApps函数中调用updateDockDividerVisibility
function loadUserApps() {
  var userApps = JSON.parse(localStorage.getItem('userApps')) || [];
  var dockIcons = document.querySelector('.dock-icons');
  
  userApps.forEach(function(app) {
    var newAppIcon = createAppIconElement(app);
    dockIcons.insertBefore(newAppIcon, dockIcons.firstChild);
  });
  
  updateDockDividerVisibility(); // 确保在加载应用时更新分割线的显示状态
}

// 在保存用户应用后调用updateDockDividerVisibility
function saveUserApps(userApps) {
  localStorage.setItem('userApps', JSON.stringify(userApps));
  updateDockDividerVisibility(); // 更新分割线的显示状态
}

// 最后，在确认删除按钮的事件处理函数中，也需要调用updateDockDividerVisibility
confirmDeleteBtn.addEventListener('click', function() {
  if (appToDelete) {
    var userApps = JSON.parse(localStorage.getItem('userApps')) || [];
    var appId = appToDelete.dataset.appId;
    var index = userApps.findIndex(function(app) {
      return app.id == appId;
    });

    if (index !== -1) {
      userApps.splice(index, 1);
      saveUserApps(userApps); // 删除后更新本地存储并检查分割线的显示状态
      appToDelete.remove();
      appToDelete = null;
    }
  }
  customDialog.style.display = 'none';
});




document.addEventListener('DOMContentLoaded', function() {
  function bindHoverEvents() {
    var dockIcons = document.querySelectorAll('.dock-icon');

    dockIcons.forEach(function(icon, index) {
      icon.addEventListener('mouseenter', function() {
        hoverEffectOnAdjacentIcons(index);
      });

      icon.addEventListener('mouseleave', function() {
        removeHoverEffectOnAdjacentIcons(index);
      });
    });

    function hoverEffectOnAdjacentIcons(index) {
      // 清理所有其他图标的hover状态，确保不冲突
      removeAllHoverEffects();
      
      // 只对相邻图标添加 'hovered'，不改变当前图标的类名
      if (index > 0) {
        dockIcons[index - 1].classList.add('hovered');
      }
      if (index < dockIcons.length - 1) {
        dockIcons[index + 1].classList.add('hovered');
      }
    }

    function removeHoverEffectOnAdjacentIcons(index) {
      // 只移除相邻图标的 'hovered' 类
      if (index > 0) {
        dockIcons[index - 1].classList.remove('hovered');
      }
      if (index < dockIcons.length - 1) {
        dockIcons[index + 1].classList.remove('hovered');
      }
    }

    function removeAllHoverEffects() {
      dockIcons.forEach(function(icon) {
        icon.classList.remove('hovered');
      });
    }
  }

  // 初次加载页面时绑定悬浮事件
  bindHoverEvents();

  // 监听 DOM 变化（如拖动和动态添加），重新绑定事件
  var dockIconsContainer = document.querySelector('.dock-icons');
  var observer = new MutationObserver(function(mutationsList) {
    for (var mutation of mutationsList) {
      if (mutation.type === 'childList') {
        bindHoverEvents(); // 重新绑定悬浮事件
      }
    }
  });

  // 开始观察
  observer.observe(dockIconsContainer, { childList: true });
});




    console.log(
        "\n" +
        " %c DOCK栏大海卖力制作 %c w"+"w"+"w"+".lzz"+"cc."+"c"+"n " +
        "\n",
        "color: #fadfa3; background: #030307; padding:5px 0; font-size:18px;",
        "background: #fadfa3; padding:5px 0; font-size:18px;"
    );