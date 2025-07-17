const fs = require('fs');
const path = require('path');

const ICON_ROOT = './icons';
const ALLOWED_EXTENSIONS = ['.svg', '.png', '.jpg', '.jpeg', '.webp'];

const result = {};

function scanFolder(folderPath, categoryName) {
  const items = fs.readdirSync(folderPath);
  const icons = items.filter(item => {
    const ext = path.extname(item).toLowerCase();
    return ALLOWED_EXTENSIONS.includes(ext);
  });
  result[categoryName] = icons;
}

function main() {
  if (!fs.existsSync(ICON_ROOT)) {
    console.error(`[ERROR] 图标目录不存在: ${ICON_ROOT}`);
    process.exit(1);
  }

  const categories = fs.readdirSync(ICON_ROOT);
  for (const category of categories) {
    const categoryPath = path.join(ICON_ROOT, category);
    const stat = fs.statSync(categoryPath);
    if (stat.isDirectory()) {
      scanFolder(categoryPath, category);
    }
  }

  const total = Object.values(result).reduce((sum, list) => sum + list.length, 0);
  const final = {
    total,
    categories: result
  };

  fs.writeFileSync('icon-map.json', JSON.stringify(final, null, 2));
  console.log(`✅ Generated icon-map.json with ${total} icons in ${categories.length} categories.`);
}

main();
