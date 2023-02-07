# make my art unsen
対象の画像の任意のエリアをブロック単位で切り出し、隅に並べた画像を生成するツール。  
生成された画像は、それ単体で当該ツールを使用し復元が可能。  


https://user-images.githubusercontent.com/113768833/217225412-461dc2e9-3187-4d7f-baaf-50ef62240f2f.mp4


変なリポジトリ名にしてしまったが、パッケージ名は暫定で Cenuncen を検討中。

## Web版
https://k4170h.github.io/make-my-art-uncen/converter.html  

## 簡単な使い方

- ![cenuncen_01](https://user-images.githubusercontent.com/113768833/217227123-70e34aa1-7133-41af-8688-7d0c8bbb2829.png)  
1. 画像をローカルファイルから開くか、クリップボードから貼り付ける。 
2. 画像上のブロックで切り出したい範囲を選択する。  
3. `ENCODE>` ボタンを押下する。  
  ![cenuncen_02](https://user-images.githubusercontent.com/113768833/217231341-bb5fb54b-82ea-4ddc-a17b-73469225e647.png)  
4. エンコード済み画像を保存する。

---

## リファレンス

<details><summary>

### エンコード(1)

</summary>

エンコード対象の画像の選択および、隠蔽範囲の選択を行う。  
範囲選択は、開いた画像に対してマウス操作(左クリックドラッグ)で指定する。  
ツール初期表示時は、このエンコード(1)画面が表示される。  
デコード目的でしか当該ツールを使わないのであれば、上述のURLに `?d=1` を付与し  
デコード画面を初期表示にできる。ブックマークURLに。  

* **Open Image**  
  エンコード対象の画像をファイルから開くか、クリップボードから貼り付ける。
* **Area Select Option**  
  隠蔽範囲に関するオプション。
  * **Grid size** : ブロックのサイズ
  * **Spacing** : ブロック間の間隔幅
* **Selected Area List**  
  選択済み隠蔽範囲の一覧を表示する。  
  取り消したい選択範囲は REMOVE を選択して削除できる。
* **ENCODE**  
  エンコード2へ。  

範囲の指定は、重ねることも可能。3回ずらして重ねれば隙間のない領域ができる。  
![cenuncen_overwrap](https://user-images.githubusercontent.com/113768833/216819613-b058ae94-25fe-46e9-ba1b-9413b4043ee2.png)

</details>

<details><summary>

### エンコード(2)

</summary>

エンコードした画像を表示する。  
本ツールでは エンコード(1)で指定した範囲をブロック単位で切り出し、隅に並べた画像を生成することをエンコードと呼称する。  
またエンコードされた画像には、隠蔽範囲やブロックの並び方についての情報が最下部にカラーバイトコードとして印字されている。  
ブロックには以下のような設定が可能で、設定を変更するたびに画像に反映される。  

* **Encode Setting**  
  隠蔽範囲から切り出したブロック群に対しての設定する。  
  * **Shuffle**  
    ブロックの順番を疑似ランダムにシャッフルする。  
  * **Rotate**  
    ブロックを疑似ランダムに回転する。  
  * **Negative**  
    ブロックを疑似ランダムに色反転する。  
  * **Contrast**  
    ブロックのコントラストを下げる。下げたことで空いた色の帯域を利用して、任意の色に近づけられる。  
    数値を低く設定すると、復元時に減色したような出来になる。(不可逆な劣化が起きる)  
    また、コントラストが低くなるとJPG保存時の劣化が激しくなる傾向にあり、デコード時の品質が下がる。（下図）  
    ![cenuncen_contrast](https://user-images.githubusercontent.com/113768833/216820015-c9b6591c-b127-4fc2-9e14-92a7fa4e3876.jpg)

  * **Key**  
    前述の "疑似ランダム" に使用する文字列（=ランダムシード）を指定する。  
    これを設定した画像はデコード時に当該Keyを入力しないと復元できなくなる。  
  * **Location**  
    ブロックの配置場所を指定する。  
  * **Fill Color**  
    塗りつぶす色を指定する。この色で塗りつぶした範囲は好きに加工してよい。
* **Save Image**  
  エンコードした画像（画面表示中の画像）を保存する。  
  エンコード済み画像をさらに編集する場合はクリップボードにコピーするか、PNGでの保存を推奨。
* **Try Decode**  
  表示中のエンコード済み画像について、お試しで リサイズ・Jpg保存 したていでデコードを行い、復元時にどのような画像になるか確認できる。

塗りつぶされた隠蔽範囲は、好きに編集してもデコード時に影響されない。  
以下のように、エンコード済み画像を差分絵みたいに再編集するのも一興。  
![cenuncen_reedit](https://user-images.githubusercontent.com/113768833/216824133-d221476e-295c-48c2-b46b-2b8d229870b6.png)  
(デコードするとサングラスが取れる というギミック)

</details>

<details><summary>

### デコード

</summary>

エンコード済み画像を復元する。  

* **Open Image**  
  デコード対象の画像をファイルから開くか、クリップボードから貼り付ける。

* **Decode Option**
  * **Clip**  
  ブロックやカラーバイトコードをデコード画像から除外する。
  * **Padding**  
  復元処理で、切り出し元にブロックを貼り付ける際にどれだけ余白を持って貼り付けるかを設定する。  
  Jpgで保存されたエンコード済み画像は、隣り合うブロック同士の影響でブロックの隅が劣化するため、  
  このような設定がある。
  * **Offset X/Y**  
  ブロックの貼り付け先をずらせる。  
  エンコード済み画像をさらにリサイズした画像は座標が端数とかで歪むのでこれで手動で調整する。
  * **Key**  
  画像がKey付きでエンコードされていた場合、ここにKeyを入力してデコードさせる。

リサイズされた画像でもデコードは可能だが、可能ならオリジナルサイズの画像を対象に行うことが望ましい。

</details>

## Chrome Extension
当該ツールはもともと Chromeの拡張機能として作り始めたものである。  
[こちら](https://chrome.google.com/webstore/detail/cenuncen/jfjppegphmhmmlehicbchefenbfmhikn)からChromeに追加するか、後述のBuildで出来上がった `dist/` をChromeの "パッケージ化されていない拡張機能を読み込む" で指定すれば導入可能。  
導入すれば、Webブラウジング中に画像を右クリック → Cenuncen → Decode でその場でデコードできる。  
Pixivのようなログインが必要なサイトでなおかつ画像が別ドメインにある場合は 諸々の問題で失敗するが、画像を新タブで開けば何とかなる。  


---

## Develop
```
$ npm -v
8.19.3
$ node -v
v18.13.0
```

### Init
```
npm install
```

### Build

```
npm run build
```

### Run

Open `dist/converter.html` , after build.  
or  
Load `dist/` on the extension page of Chrome in developer mode.

### This project started with

[chrome-extension-typescript-starter](https://github.com/chibat/chrome-extension-typescript-starter/)
