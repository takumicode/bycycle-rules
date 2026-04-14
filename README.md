# 自転車標識クイズ

2026年4月から自転車にも青切符制度が導入されました。
道路標識の自転車関連ルールを4択クイズで確認できる静的サイトです。

## 構成

- `index.html` / `style.css` / `app.js` — クイズUI（依存ライブラリなし）
- `data/signs.json` — 12種類の標識データ
- `images/signs/*.svg` — Wikimedia Commons（パブリックドメイン）

## ローカル起動

```
python3 -m http.server
```

`http://localhost:8000` を開く。

## ライセンス

標識画像は Wikimedia Commons のパブリックドメイン素材。
コードは MIT。
