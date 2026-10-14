
# WebGIS Docker 教學範例

這個專案是給學生的 WebGIS 入門練習環境。
目前先用最小可運作的網頁服務示範「建置映像檔 -> 啟動容器 -> 瀏覽器查看結果」的完整流程，後續可以在此基礎上加入地圖函式庫（例如 Leaflet、OpenLayers）。

## 學習目標

完成這份範例後，你應該可以：

1. 了解 Docker 映像檔與容器的差異。
2. 使用 Docker 建置與執行一個簡單網頁服務。
3. 理解主機 Port 與容器 Port 的映射關係。
4. 修改網頁內容並重新部署查看變化。

## 專案結構

```text
php-server/
├─ readme.md
└─ image/
	├─ Dockerfile
	└─ src/
		└─ index.html
```

## 環境需求

1. 已安裝 Docker Desktop（macOS / Windows）或 Docker Engine（Linux）。
2. 可以在終端機執行 `docker --version`。

## 快速開始

在專案根目錄執行以下指令：

### 1) 建置映像檔

```bash
docker build -t example image/
```

### 2) 啟動容器

```bash
docker run -it --rm --name example -p 21822:80 example
```

說明：

1. `-p 21822:80` 代表「本機 21822 -> 容器 80」。
2. `--rm` 代表容器停止後自動刪除。
3. `--name example` 方便你後續停止容器。

### 3) 開啟網頁

在瀏覽器輸入：

```text
http://localhost:21822/index.html
```

## 修改與重跑

當你修改 `image/src/index.html` 後，需要重新建置映像檔再啟動容器：

```bash
docker build -t example image/
docker rm -f example >/dev/null 2>&1 || true
docker run -it --rm --name example -p 21822:80 example
```

## 常見問題

### Q1. 為什麼瀏覽器打不開頁面？

請依序檢查：

1. 容器是否真的有啟動（`docker ps`）。
2. 是否使用正確位址（`http://localhost:21822/index.html`）。
3. Port 映射是否正確（主機 Port 要對到容器實際監聽 Port）。

### Q2. 出現 `port is already allocated` 怎麼辦？

代表本機 Port 已被占用，可採用其中一種方式：

1. 先停止舊容器後再啟動。
2. 改用其他主機 Port，例如 `-p 21823:80`。

## 課堂延伸練習（WebGIS）

1. 把 `index.html` 改成地圖頁，載入 OSM 底圖。
2. 在地圖上加入一個標記點與彈出視窗。
3. 嘗試載入 GeoJSON 並設定樣式。
4. 討論前端靜態頁面部署到容器的優缺點。

## 參考指令

```bash
# 查看執行中的容器
docker ps

# 查看容器輸出
docker logs example

# 停止容器
docker rm -f example
```
