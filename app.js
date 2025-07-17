const grid = document.getElementById('icon-grid');
const count = document.getElementById('count');
const cdnBase = 'https://your-cdn.example.com/icons/';

fetch('icon-map.json')
  .then(res => res.json())
  .then(data => {
    count.textContent = `共收录图标 ${data.total} 个`;
    data.icons.forEach(icon => {
      const div = document.createElement('div');
      div.className = 'icon-item';
      div.innerHTML = `
        <img src="${cdnBase + icon}" alt="${icon}" />
        <div>${icon}</div>
      `;
      div.onclick = () => {
        const fullUrl = cdnBase + icon;
        navigator.clipboard.writeText(fullUrl);
        alert(`已复制链接：\n${fullUrl}`);
      };
      grid.appendChild(div);
    });
  })
  .catch(err => {
    count.textContent = '加载失败';
    console.error(err);
  });
