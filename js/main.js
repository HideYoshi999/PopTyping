

//問題文(csv)
let mondai=[];


//表示用の変数
let word;
let p_word;
//let p_level;   << csv上での文字数。まだ使わない

//問題番号
let problemNum;

//出題管理用の変数
let first = true; //最初の問題か
let tmp;
let random;


//入力数
let loc;

//リザルト
let wordCount;
let summonLevel;
let score;
let typeMiss;
// let accuracy;
let typeSpeed;


//制限時間
const timeLimit = 60 * 1000;

//ゲーム管理
let startTime;
let startFlg = false;

//HTMLのID
const problemWord = document.getElementById('problemWord');
const typingWord = document.getElementById('typingWord');
const wordCountLabel = document.getElementById('wordCount');
const summonLevelLabel = document.getElementById('summonLevel');
const scoreLabel = document.getElementById('score');
const typeMissLabel = document.getElementById('typeMiss');
const timeLeftLabel = document.getElementById('timeLeft');
// const accuracyLabel = document.getElementById('accuracy');


/**********************サウンド関連 */
//SEのファイル読み込み
let typeSE = new Audio("sound/type.mp3");

//SE再生
function playSE(SE){  
  SE.currentTime = 0;//初期化
  SE.play();
}

//BGM再生
function playBGM(BGM){  
  BGM.currentTime = 0;//初期化
  BGM.play();
}
/**********************サウンド関連 */

/**********************クリックでスタート　初期化処理*/
window.addEventListener('click', () => {
  if (startFlg === true) {
    return;
  }

  //変数初期化
  startFlg = true;
  loc = 0;  
  wordCount = 0;
  summonLevel = 0;
  score = 0;
  typeMiss = 0;
  //accuracy = 0;
  typeSpeed = 0;
  random = 0;
  tmp = 0;

  //HTML要素に変換
  typeMissLabel.textContent = typeMiss;
  //accuracyLabel.textContent = accuracy;
  summonLevelLabel.textContent = summonLevel;
  scoreLabel.textContent = score;

  //csv読み込み
  var req = new XMLHttpRequest(); // HTTPでファイルを読み込むためのXMLHttpRrequestオブジェクトを生成
  req.open("get", "csv/mondai.csv", true); // アクセスするファイルを指定
  req.send(null); // HTTPリクエストの発行

  // レスポンスが返ってきたらconvertCSVtoArray()を呼ぶ	
  req.onload = function(){
    mondai = convertCSVtoArray(req.responseText); // 渡されるのは読み込んだCSVデータ
    
     //問題取得
     getMondai();

    scoreLabel.textContent = '0粒';
  }

  //読み込みエラー
  req.onerror = function(e){
    console.log("CSV読み込みエラー");
  }


  //カウントダウン開始
  startTime = Date.now();
  updateTimeLimit();

});
/**********************クリックでスタート初期化処理*/

/**********************キー入力*/

//キーダウン検知
window.addEventListener('keydown', e => {
  if (startFlg === false) {
    return;
  }

  //タイプ音再生
  playSE(typeSE);

  if (e.key === word[loc]){
    loc++;
    if (loc === word.length) {
     
      //問題取得
      getMondai();
      
      loc = 0;
    }
    updateTypingWord();

    //入力文字数カウント
    wordCount++;
    

    //召喚レベル
    summonLevel = Math.floor((wordCount/10)+1);
    summonLevelLabel.textContent = summonLevel;
    
    //スコアカウント
    score += summonLevel;
    scoreLabel.textContent = score + '粒';

  } else if (e.key === 'Shift') {//大文字検知
    ;
  } else {//タイプミス
    typeMiss++;
    typeMissLabel.textContent = typeMiss;
  }
});

//入力分の更新
function updateTypingWord() {
  let update = '';
  for (let i = 0; i < loc; i++){
    update += '*';
  }
  problemWord.textContent = p_word;
  typingWord.textContent = update + word.substring(loc);
}
/**********************キー入力*/

/**********************ゲーム管理 */
//カウントダウン
function updateTimeLimit() {
  const timer = startTime + timeLimit - Date.now();
  timeLeftLabel.textContent = (timer / 1000).toFixed(2);

  const timeoutId = setTimeout(() => {
    updateTimeLimit();
  }, 10);

//ゲーム終了後
  if (timer < 0) {
    startFlg = false;
    clearTimeout(timeoutId);
    timeLeftLabel.textContent = '0.00';
    
    //リザルト表示
    setTimeout(() => {
      alert('タイムアップ')
      // accuracy = wordCount + typeMiss === 0 ? 0 : wordCount / ( wordCount + typeMiss ) * 100;
      // accuracyLabel.textContent = accuracy.toFixed(2);
      problemWord.textContent = "ゲーム終了" 
     
    }, 100);

    typingWord.textContent = 'Click to replay';
  }
}
/**********************ゲーム管理 */


/**********************問題管理用の関数 */

// 読み込んだCSVデータを二次元配列に変換する関数convertCSVtoArray()の定義
function convertCSVtoArray(str){ 
  result = [];
  tmp = str.split("\n"); // 改行を区切り文字として行を要素とした配列を生成

  
  for(var i=0;i<tmp.length;++i){
      result[i] = tmp[i].split(',');
  }
  
  return result;
}

//問題取得
function getMondai(){

  problemNum = levelManager(summonLevel); 
  //console.log("問題:" +problemNum);

  p_word = mondai[problemNum][0];
  word = mondai[problemNum][1];
  //p_level = mondai[problemNum][2];

  problemWord.textContent = p_word;
  typingWord.textContent = word;
}


//問題出題管理
function levelManager(level){

  let min;
  let max; 


  //レベル管理
  if(level > 12){
       min = 60;
       max = mondai.length;
  }
  else if(level >= 8)
  {
    min = 40;
    max = 60;
  }
  else if(level >= 4){
    min = 20;
    max = 40;
  }
  else{
    min = 0;
    max = 20;
  }

  //連続で同じ問題を出題しないようにする
  if(first){
    random = Math.floor( Math.random() * (max + 1 - min) ) + min;
    first = false;
  }
  else{
    
    while(random == tmp){
      random = Math.floor( Math.random() * (max + 1 - min) ) + min;
      console.log("tmp:"+tmp," random:" +random );
    }
  }

  tmp = random;
  return random;
  
}
/***********************問題管理用の関数 */
