window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange|| window.webkitIDBKeyRange || window.msIDBKeyRange;
window.IDBCursor = window.IDBCursor || window.webkitIDBCursor || window.msIDBCursor;

//DB呼び出し
var dbName = "mecoDB";
var dbVersion = 1;
var idb;

var memoTitleList;

function save(){
	//画面情報を保存

	var title = document.getElementById('title');
	var article = document.getElementById('article');
	var memoId = title.dataset.id;
	console.log("title:"+title.value);
	console.log("memoID:"+title.dataset.id);
	console.log("article:"+article.value);

	//トランザクション開く
	//storeNameは複数書ける。でも同一トランザクションなので注意
	var storeNames = ['Memos'];
	var mode = IDBTransaction.READ_WRITE;
	if (mode === undefined)
		mode = "readwrite";

	var tx = idb.transaction(storeNames,mode);

	tx.complete = function(e){console.log("transaction完了");};
	tx.abort = function(e){console.log("transaction中止");};

	var store = tx.objectStore("Memos");
	console.log("store:" + store);

	store.onsuccess = function(e){
		console.log("objectStore接続完了");
	};
	store.onerror = function(e){
		console.log("objectStore接続中止");
	};

	if(memoId == undefined || memoId == ""){
		//put
		var value = {
			title: title.value,
			address: article.value
		};

		var req = store.put(value);
		console.log("req:"+req);
		req.onsuccess = function(e){
			console.log("DB保存成功");

			memoTitleList.innerHTML="";
			getMemoList();
			clearInputArea();
			showHome();
		};
		req.onerror = function(e){
			console.log("DB保存失敗:"+e);
		};

	}else{
		//update
		memoId = parseInt(memoId);
		var range = IDBKeyRange.bound(memoId, memoId);

		var req = store.openCursor(range);
		console.log(req);
		req.onsuccess = function(e){
			var cursor = this.result;
			var data = cursor.value;

			data.title = title.value;
			data.address = article.value;

			if(cursor){
				cursor.update(data);
			
				memoTitleList.innerHTML="";
				getMemoList();
				clearInputArea();
				showHome();
			}
		};
		req.onerror = function(e){
			console.log("DB保存失敗:"+e);
		};
	}
}

function deleteMemo(){
	var title = document.getElementById('title');
	var memoId = title.dataset.id;
	console.log("memoID:"+title.dataset.id);

	var storeNames = ['Memos'];
	var mode = IDBTransaction.READ_WRITE;
	if (mode === undefined)
		mode = "readwrite";

	var tx = idb.transaction(storeNames,mode);
	tx.complete = function(e){console.log("transaction完了");};
	tx.abort = function(e){console.log("transaction中止");};

	var store = tx.objectStore("Memos");
	store.onsuccess = function(e){console.log("objectStore接続完了");};
	store.onerror = function(e){console.log("objectStore接続中止");};

	memoId = parseInt(memoId);
	var range = IDBKeyRange.bound(memoId, memoId);

	var req = store.openCursor(range);
	console.log(req);
	req.onsuccess = function(e){
		var cursor = this.result;

		if(cursor){
			cursor.delete();
		
			memoTitleList.innerHTML="";
			getMemoList();
			clearInputArea();
			showHome();
		}
	};
	req.onerror = function(e){
		console.log("DB保存失敗:"+e);
	};
}

function getMemo(id,callback){
	//トランザクション開く
	var storeNames = ['Memos'];
	var mode = IDBTransaction.READ_ONLY;
	if (mode === undefined)
		mode = "readonly";

	var tx = idb.transaction(storeNames,mode);
	tx.complete = function(e){
		console.log("transaction完了");
		alert("transaction完了");
	};
	tx.abort = function(e){
		console.log("transaction中止");
	};

	var store = tx.objectStore("Memos");
	store.onsuccess = function(e){
		console.log("transaction完了");
		alert("transaction完了");
	};
	store.onerror = function(e){
		console.log("transaction中止");
	};

	//idで取得する用
	console.log(id);

	var req = store.get(parseInt(id));
	console.log(req);
	req.onsuccess = function(e){
		console.log("memo取得onSuccess!");
		if(this.result === undefined){
			console.log("not found.");
		}else{
			console.log(this.result);

			if(callback){
				callback(this.result);
			}

		}
	};
	req.onerror = function(e){
		console.log("取得失敗");
	};
}

function getMemoList(){

	//トランザクション開く
	var storeNames = ['Memos'];
	var mode = IDBTransaction.READ_ONLY;
	if (mode === undefined)
		mode = "readonly";

	var tx = idb.transaction(storeNames,mode);
	tx.complete = function(e){console.log("transaction完了");};
	tx.abort = function(e){console.log("transaction中止");};

	var store = tx.objectStore("Memos");
	store.onsuccess = function(e){console.log("transaction完了");};
	store.onerror = function(e){console.log("transaction中止");};

	//全件取得。cursorの引数には、検索条件をいれる。
	var req = store.openCursor();
	var memoList = [];

	req.onsuccess = function(e){
		var cursor = this.result;
		if(cursor){
			console.log(cursor.value);
			memoList.push(cursor.value);

			renderMemoTitle(cursor.value);

			cursor.continue();
		}else{
			console.log("cursor end");
		}
	};
	req.onerror = function(d) {console.log("openCursor error:" + e);}

	//保存件数取得
	// var req = store.count();
	// req.onsuccess = function(){
	//     console.log( this.result + ' records in this object store.' );
	// }
}

function clearInputArea(){
	var title = document.getElementById('title');
	title.value = "";
	var article = document.getElementById('article');
	article.value = "";
}

function showEdit(){
	var home = document.getElementById("home");
	home.classList.add("hide");
	var edit = document.getElementById("edit");
	edit.classList.remove("hide");

	var title = document.getElementById("title");
	title.dataset.id = "";
}

function showHome(){
	var home = document.getElementById("home");
	home.classList.remove("hide");
	var edit = document.getElementById("edit");
	edit.classList.add("hide");
	clearInputArea();
}

function renderEdit(e){
	console.log(e);
	var memoId = this.dataset.id;
	showEdit();

	getMemo(memoId,renderMemo);
}

function renderMemo(memo){
	var title = document.getElementById('title');
	title.value = memo.title;
	title.dataset.id = memo.memoId;
	var article = document.getElementById('article');
	article.value = memo.address;
}

function renderMemoTitle(memo){
	var memoTitle = document.createElement("li");
	memoTitle.classList.add("boxLink");

	var memoTitleLink = document.createElement("a");
	memoTitleLink.dataset.id = memo.memoId;
	memoTitleLink.addEventListener("click", renderEdit);

	var memoTitleText = document.createElement("span");
	memoTitleText.innerHTML = memo.title;

	console.log("memoTitle:"+memo.title);
	memoTitleLink.appendChild(memoTitleText);
	memoTitle.appendChild(memoTitleLink);
	memoTitleList.appendChild(memoTitle);
}

function init(){
	var edit = document.getElementById("edit");
	edit.classList.add("hide");

	var addMemoButton = document.getElementById("addMemo");
	addMemoButton.addEventListener("click", showEdit);

	var returnHomeButton = document.getElementById("returnHome");
	returnHomeButton.addEventListener("click", showHome);

	var testUL = document.getElementById("testUL");

	openDB();

	var saveButton = document.getElementById("save");
	saveButton.addEventListener("click",save);

	var deleteButton = document.getElementById("delete");
	deleteButton.addEventListener("click",deleteMemo);

	memoTitleList = document.getElementById("dataList");
}

function openDB(){
	var dbConnect = indexedDB.open(dbName,dbVersion);
	console.log("dbConnect：" + dbConnect);

	//DBのバージョンを見る処理
	//dbConnectのonsuccessよりonupgradeneeded方が先に呼ばれる。
	dbConnect.onupgradeneeded = function(e){
		idb = e.target.result;

		//すでにオブジェクトストアがあった場合削除する
		if (idb.objectStoreNames.contains("Memos")) {
			idb.deleteObjectStore("Memos");
		}
			//オブジェクトストア生成
			var name = "Memos";
			var optionalParameters = {
				keyPath: "memoId",
				autoIncrement: true
			};
			var store = idb.createObjectStore(name,optionalParameters);
			console.log(store);

			//インデックス生成
			var name = "memoTitleIndex";
			var keyPath = "title";
			var optionalParameters = {
				unique: false,
				multiEntry: false
			};
			store.createIndex(name,keyPath,optionalParameters);
			console.log("created objectStore");
		// }
	};

	dbConnect.onsuccess = function(e){
		idb = e.target.result;
		console.log("DB接続完了");

		getMemoList();
	};

	dbConnect.onerror = function(e){console.log("DB接続失敗：" + e);};
}

window.onload = init;
