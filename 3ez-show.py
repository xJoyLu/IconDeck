import http.server
import socketserver
import os
import json # 引入json库，更安全地生成JS数组
import urllib.parse

PORT = 8000
IMAGE_DIR = '3ez'

# --- 好消息: 这是最终版脚本，应该能解决问题 ---

class AlbumRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.path = urllib.parse.unquote(self.path)
        
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()

            image_files = []
            if os.path.exists(IMAGE_DIR):
                try:
                    files = os.listdir(IMAGE_DIR)
                    for f in files:
                        if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                            # 构造一个在所有操作系统上都正确的URL路径
                            path = f"{IMAGE_DIR}/{f}" 
                            image_files.append(path)
                except Exception as e:
                    print(f"读取目录 '{IMAGE_DIR}' 时出错: {e}")

            print(f"--- 在 '{IMAGE_DIR}' 目录中找到 {len(image_files)} 张图片。正在生成页面... ---")

            # [关键改进] 使用 json.dumps 来安全地将Python列表转换为JavaScript数组字符串
            # 这可以完美处理文件名中的空格、引号等所有特殊字符
            image_urls_js = json.dumps(image_files, ensure_ascii=False)

            html_content = f"""
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3ez 自动相册</title>
    <style>
        body {{ font-family: sans-serif; background-color: #f0f0f0; margin: 0; padding: 20px; }}
        h1 {{ text-align: center; color: #333; }}
        .gallery {{
            column-count: 4; column-gap: 15px; width: 90%; max-width: 1200px; margin: 0 auto;
        }}
        .gallery-item {{
            display: inline-block; margin-bottom: 15px; width: 100%;
            overflow: hidden; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            break-inside: avoid; /* 防止瀑布流中的项目被截断 */
        }}
        .gallery-item img {{
            width: 100%; height: auto; display: block; transition: transform 0.3s ease;
        }}
        .gallery-item img:hover {{ transform: scale(1.05); }}
        @media (max-width: 1024px) {{ .gallery {{ column-count: 3; }} }}
        @media (max-width: 768px) {{ .gallery {{ column-count: 2; }} }}
        @media (max-width: 480px) {{ .gallery {{ column-count: 1; }} }}
    </style>
</head>
<body>
    <h1>我的 3ez 相册 (自动更新)</h1>
    <div class="gallery" id="image-gallery"></div>
    <script>
        document.addEventListener("DOMContentLoaded", function() {{
            // imageUrls 现在由Python的json库安全地生成
            const imageUrls = {image_urls_js};
            
            const gallery = document.getElementById('image-gallery');
            imageUrls.forEach(url => {{
                const item = document.createElement('div');
                item.className = 'gallery-item';
                const img = document.createElement('img');
                img.src = url;
                img.alt = '相册图片';
                item.appendChild(img);
                gallery.appendChild(item);
            }});
        }});
    </script>
</body>
</html>
            """
            self.wfile.write(html_content.encode('utf-8'))
        else:
            super().do_GET()

with socketserver.TCPServer(("", PORT), AlbumRequestHandler) as httpd:
    print(f"相册服务器已启动，请在浏览器中打开 http://localhost:{PORT}")
    print(f"请将图片文件放入 '{IMAGE_DIR}' 文件夹中")
    print("按 Ctrl+C 停止服务器")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\\n服务器已关闭。")
        httpd.shutdown()

