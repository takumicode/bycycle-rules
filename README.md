# 道路標識クイズ

2026年4月から自転車にも青切符制度が導入されました。
自転車・自動車それぞれの道路標識を4択で学べる静的サイトです。

公開URL: https://takumicode.github.io/bycycle-rules/

## ファイル構造

```
bycycle-rules/
├── index.html              # モード選択 + クイズUI（単一ページ）
├── style.css               # BEM準拠スタイル（l- / c- / u- プレフィックス）
├── app.js                  # 出題・採点・モード切替ロジック（依存なし）
├── README.md
├── .gitignore
├── data/
│   ├── signs-bicycle.json  # 自転車モードの問題データ（37問）
│   └── signs-car.json      # 自動車モードの問題データ（43問）
└── images/signs/*.svg      # 標識画像（Wikimedia Commons / PD）
```

## データ仕様

`data/signs-*.json` は配列。各要素は1つの標識（=1問）。

```jsonc
{
  "id": "330",                   // 識別子（警察庁の標識番号ベース）
  "name": "一時停止",             // 正解の選択肢
  "image": "images/signs/Japan_road_sign_330.svg",
  "supplement": "自転車を除く",   // 任意。補助標識のテキスト
  "explanation": "停止線の直前で...",
  "wrong": ["徐行", "停止禁止", "前方優先道路"]  // 誤答3つ
}
```

- `supplement` があると本標識の下に白地・黒枠の補助標識が合成表示される
- `wrong` は3件必須。ゲーム開始時に正解と混ぜてシャッフル
- 1ゲーム15問、プールからランダム抽出

## モード切替

- トップでモード選択 → 内部状態変更＋`?mode=bicycle|car` をURLに反映（history.replaceState）
- 直リンク対応：`?mode=car` 付きでアクセスすると直接クイズ開始
- Xシェア文面もモード別に自動生成

## 標識を追加するには

1. `images/signs/` にSVGを配置（Wikimedia Commons から `curl -L "https://commons.wikimedia.org/wiki/Special:FilePath/<ファイル名>"` で取得）
2. 対応する `signs-bicycle.json` または `signs-car.json` にエントリ追加
3. 共有する場合は両方に追加（説明文はモード視点に合わせて調整）

補助標識パターンの追加は、既存の本標識SVGを `image` に指定し `supplement` にテキストを入れるだけ。画像を新しく用意する必要はない。

## ローカル起動

```sh
python3 -m http.server
# http://localhost:8000/ を開く
```

## ライセンス

- 標識画像: Wikimedia Commons（パブリックドメイン）
- コード: MIT
