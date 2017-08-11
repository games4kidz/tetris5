/* GameUI.js

Copyright (c) 2011- SUN Junwen

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

/*
 *	Type
 *	0 - 方块
 *	1 - 长条
 *	2 - 三角
 *	3 - 左折角
 *	4 - 右折角
 *	5 - z 字
 *	6 - 反 z 字
 *
 *	style
 *	0 - 躺着
 *	顺时针转
 */

/**
 * @author  Sun Junwen
 */

var GameUI = {
	
	// constants
	ANI_INTERVAL : 25, // 根据性能调整这个值
	ANI : false, // 是否动画
	BKGIMG_SRC : "imgs/gameBkg.png",
	REDIMG_SRC : "imgs/redBlock-t.png",
	YELLOWIMG_SRC : "imgs/yellowBlock-t.png",
	BLUEIMG_SRC : "imgs/blueBlock-t.png",
	GREENIMG_SRC : "imgs/greenBlock-t.png",
	BLACKIMG_SRC : "imgs/blackBlock-t.png",
	BKGAUDIO_OGG_SRC : "imgs/clouds.ogg",
	BKGAUDIO_MP3_SRC : "imgs/clouds.mp3",
	
	FLASH_BTN_CLASS : "btnHover",
	
	NEW_GAME_STR : "<u>N</u>ew Game",
	PAUSE_STR : "<u>P</u>ause",
	RESUME_STR : "<u>R</u>esume",
	NOT_RESUME_STR : "<del><u>R</u>esume</del>",
	MUTE_STR : "<u>M</u>ute",
	NOT_MUTE_STR : "<del><u>M</u>ute</del>",
	HELP_STR : "<u>H</u>elp",
	RANK_STR : "Ran<u>k</u>",
	BACK_STR : "<u>B</u>ack",
	
	m_debug : $("#debug"),
	
	// constructor
	m_id : "", // unique id
	
	m_cubeFrame : $("#cubeFrame"),
	m_cubeReel : $("#cubeReel"),
	m_cubeMenu : $("#cubeMenu"),
	m_cubeGame : $("#cubeGame"),
	
	HELP_PAGE : 0,
	RANK_PAGE : 1,
	MENU_PAGE : 2,
	GAME_PAGE : 3,
	m_curPage : 2, // 0 - Help, 1- Rank, 2 - Menu, 3 - Game
	
	m_game : null,
	
	m_gameVector : null,
	m_tempVector : null,
	m_disQueue : null,
	m_timer : 0,
	m_afterAni : null,
	
	m_debugui : $("#gameui"),
	m_canvas : $("#canvasGame"),
	m_canvasDraw : null,
	m_div : $("#divGame"),
	
	m_canvasNext : $("#canvasNext"),
	m_divScore : $("#gameScore"),
	m_divLevel : $("#gameLevel"),
	m_divTime : $("#gameTime"),
	
	m_btnStart : $(".btnStart"),
	m_btnPause : $(".btnPause"),
	m_btnHelp : $(".btnHelp"),
	m_btnRank : $(".btnRank"),
	m_btnMute : $(".btnMute"),
	m_btnMenu : $(".btnMenu"),
	
	m_pPlayed : $("#playedInfo"),
	
	m_menuBtns : null,
	m_menuSel : -1,
	
	m_curActiveBtn : null,
	m_loopFlash : false,
	
	m_blocks : null,
	
	m_aniCount : 0,
	
	m_bkgImg : null,
	m_redImg : null,
	m_yellowImg : null,
	m_blueImg : null,
	m_greenImg : null,
	m_blackImg : null,
	m_blockImgs : null,
	m_audio : null,
	
	m_curScore : 0,
	m_curLevel : 0,
	m_lastPlayTime : 0,
	m_lastRank : 0,
	
	m_lastList : "",
	m_currentList : "",
	
	m_marginTop : 0,
	
	init : function () {
		// 垂直居中游戏
		GameUI.changeMarginTop();
		$(window).resize(GameUI.changeMarginTop);
		
		// 准备 Canvas 版 Game
		if (GameUI.m_canvas.length) {
			GameUI.m_canvas = GameUI.m_canvas[0];
			GameUI.m_canvasDraw = GameUI.m_canvas.getContext('2d');
			
			GameUI.m_canvas.addEventListener("click", GameUI.gameClicked, false);
		}
		
		// 准备 div 版 Game
		if (GameUI.m_div.length) {
			GameUI.m_blocks = new Array(20);
			for (var i = 0; i < 20; ++i) {
				GameUI.m_blocks[19 - i] = new Array(10);
				var line = $("<div/>");
				line.addClass("line" + (19 - i));
				for (var j = 0; j < 10; ++j) {
					var block = $("<div/>");
					block.addClass("block" + j);
					block.addClass("block");
					block.append($("<div/>"));
					GameUI.m_blocks[19 - i][j] = block;
					line.append(block);
				}
				line.append($("<div/>").addClass("clear"));
				GameUI.m_div.append(line);
			}
		}
		
		// 准备 CanvasNext
		if (GameUI.m_canvasNext.length) {
			GameUI.m_canvasNext = GameUI.m_canvasNext[0];
			GameUI.m_canvasNext = GameUI.m_canvasNext.getContext('2d');
		}
		
		// Pause/Resume 按钮，在菜单里
		GameUI.m_btnPause.html(GameUI.PAUSE_STR);
		GameUI.m_btnPause.click(function () {
			GameUI.pauseGame();
		});
		
		// Start 菜单里 New Game
		GameUI.m_btnStart.html(GameUI.NEW_GAME_STR);
		GameUI.m_btnStart.click(function () {
			GameUI.startGame();
		});
		
		GameUI.m_btnMute.click(function () {
			GameUI.mute();
		});
		
		// Rank 按钮
		GameUI.m_btnRank.html(GameUI.RANK_STR);
		GameUI.m_btnRank.click(function () {
			GameUI.switchToRank(false);
		});
		
		// Help 按钮
		GameUI.m_btnHelp.html(GameUI.HELP_STR);
		GameUI.m_btnHelp.click(function () {
			GameUI.switchToHelp();
		});
		
		// Back 按钮
		GameUI.m_btnMenu.html(GameUI.BACK_STR);
		GameUI.m_btnMenu.click(function () {
			GameUI.switchToMenu();
		});
		
		/*GameUI.m_menuBtns = new Array();
		GameUI.m_menuBtns[0] = GameUI.m_btnStart;
		GameUI.m_menuBtns[1] = GameUI.m_btnPause;*/
		
		// 绑定按键
		document.documentElement.onkeydown = function (e) {
			e = e || window.event;
			var ec = e.which || e.keyCode;
			if (ec == 87 || ec == 38) // up, w
			{
				switch (GameUI.m_curPage) {
				case GameUI.GAME_PAGE: // Game
					GameUI.keyRotate();
					break;
				}
			} else if (ec == 83 || ec == 40) // down, s
			{
				switch (GameUI.m_curPage) {
				case GameUI.GAME_PAGE: // Game
					GameUI.keyDown();
					break;
				}
			} else if (ec == 65 || ec == 37) // left, a
				GameUI.keyLeft();
			else if (ec == 68 || ec == 39) // right, d
				GameUI.keyRight();
			else if (ec == 88) // x
				GameUI.keyDownToBase();
			else if (ec == 78) // n
			{
				if (GameUI.m_curPage == GameUI.MENU_PAGE)
					GameUI.startGame();
			} else if (ec == 80 || ec == 82) // p, r
			{
				GameUI.pauseGame();
				GameUI.flashButton(GameUI.m_btnPause, false);
			} else if (ec == 75) // k
			{
				if (GameUI.m_curPage == GameUI.MENU_PAGE)
					GameUI.switchToRank(false);
			} else if (ec == 72) // h
			{
				if (GameUI.m_curPage == GameUI.MENU_PAGE)
					GameUI.switchToHelp();
			} else if (ec == 77) // m
			{
				GameUI.mute();
				GameUI.flashButton(GameUI.m_btnMute, false);
			} else if (ec == 66) // b
			{
				if (GameUI.m_curPage == GameUI.HELP_PAGE ||
					GameUI.m_curPage == GameUI.RANK_PAGE)
					GameUI.switchToMenu();
			}
		};
		
		// 绑定关闭
		window.onbeforeunload = function () {
			if (GameUI.m_game != null && GameUI.m_game.IsRunning() && !GameUI.m_game.IsPaused()) {
				GameUI.pauseGame();
			}
			
			return "Really Exit?";
		};
		
		// 载入或者申请唯一 id
		if (localStorage['id']) {
			// 已经有 id
			GameUI.m_id = localStorage['id'];
		} else {
			// 没有 id 需要申请
			var randNum = Math.random();
			$.ajax({
				type : "GET",
				url : "http://tetris5.sourceforge.net/ajax.php",
				dataType : "jsonp",
				data : {
					oper : "genid",
					rand : randNum
				},
				success : function (data) {
					GameUI.m_id = data["data"];
					localStorage['id'] = GameUI.m_id;
				}
			});
		}
		
		// 读取 played info
		$.ajax({
			type : "GET",
			url : "http://tetris5.sourceforge.net/ajax.php",
			dataType : "jsonp",
			data : {
				oper : "played"
			},
			success : function (data) {
				var count = data.count;
				var sum = data.sum;
				GameUI.m_pPlayed.html("Tetris5 has been played " + count + " times.<br />And totally scored " + sum + " points.<br />Just enjoy it!");
			}
		});
		
		GameUI.switchToMenu();
		
		GameUI.loadRes();
	},
	
	/**
	 * Begin to load resources
	 */
	loadRes : function () {
		GameUI.loadBkgImg();
	},
	
	loadBkgImg : function () {
		GameUI.m_bkgImg = new Image();
		GameUI.m_bkgImg.onload = GameUI.loadRedImg;
		GameUI.m_bkgImg.src = GameUI.BKGIMG_SRC;
	},
	
	loadRedImg : function () {
		GameUI.m_redImg = new Image();
		GameUI.m_redImg.onload = GameUI.loadYellowImg;
		GameUI.m_redImg.src = GameUI.REDIMG_SRC;
	},
	
	loadYellowImg : function () {
		GameUI.m_yellowImg = new Image();
		GameUI.m_yellowImg.onload = GameUI.loadBlueImg;
		GameUI.m_yellowImg.src = GameUI.YELLOWIMG_SRC;
	},
	
	loadBlueImg : function () {
		GameUI.m_blueImg = new Image();
		GameUI.m_blueImg.onload = GameUI.loadGreenImg;
		GameUI.m_blueImg.src = GameUI.BLUEIMG_SRC;
	},
	
	loadGreenImg : function () {
		GameUI.m_greenImg = new Image();
		GameUI.m_greenImg.onload = GameUI.loadBlackImg;
		GameUI.m_greenImg.src = GameUI.GREENIMG_SRC;
	},
	
	loadBlackImg : function () {
		GameUI.m_blackImg = new Image();
		GameUI.m_blackImg.onload = GameUI.loadBkgAudio;
		GameUI.m_blackImg.src = GameUI.BLACKIMG_SRC;
	},
	
	loadBkgAudio : function () {
		/*if ($.browser.safari) {
		GameUI.m_btnMute.html(GameUI.MUTE_STR);
		GameUI.afterLoadRes();
		return;
		}*/
		
		GameUI.m_audio = new Audio();
		if (localStorage["mute"] == 1) {
			GameUI.m_btnMute.html(GameUI.NOT_MUTE_STR);
			GameUI.m_audio.volume = 0;
		} else {
			GameUI.m_btnMute.html(GameUI.MUTE_STR);
			GameUI.m_audio.volume = 0.1;
		}
		GameUI.m_audio.addEventListener('ended', function () {
			GameUI.m_audio.currentTime = 0;
			GameUI.m_audio.play();
		}, false);
		if (!$.browser.opera) {
			GameUI.m_audio.src = Modernizr.audio.ogg ? GameUI.BKGAUDIO_OGG_SRC : GameUI.BKGAUDIO_MP3_SRC;
			GameUI.m_audio.play();
		}
		GameUI.afterLoadRes();
	},
	
	afterLoadRes : function () {
		GameUI.m_blockImgs = new Array();
		GameUI.m_blockImgs[1] = GameUI.m_redImg;
		GameUI.m_blockImgs[2] = GameUI.m_yellowImg;
		GameUI.m_blockImgs[3] = GameUI.m_blueImg;
		GameUI.m_blockImgs[4] = GameUI.m_greenImg;
		GameUI.m_blockImgs[5] = GameUI.m_blackImg;
		
		GameUI.m_game = Game;
		GameUI.m_game.Init(GameUI);
		GameUI.m_game.ANI = GameUI.ANI;
		GameUI.m_game.SetAutoUp(0);
		//GameUI.m_game.Start();
		
		if (GameUI.loadGame()) {
			GameUI.m_btnPause.html(GameUI.RESUME_STR);
		} else {
			GameUI.m_btnPause.html(GameUI.NOT_RESUME_STR);
		}
		
		$("#menuLoading").slideUp();
		
		GameUI.repaint();
	},
	
	stopBubble : function (e) {
		var e = e ? e : window.event;
		if (window.event) {
			e.cancelBubble = true;
		} else {
			e.stopPropagation();
		}
	},
	
	gameClicked : function (e) {
		var pos = GameUI.getCurPos(e);
		//alert(pos);
		switch (pos) {
		case 0:
			GameUI.keyRotate();
			break;
		case 1:
			GameUI.keyLeft();
			break;
		case 2:
			GameUI.keyRight();
			break;
		case 3:
			GameUI.keyDownToBase();
		}
	},
	
	getCurPos : function (e) {
		/* returns 0 - Top, 1 - Left, 2 - Right, 3 - Bottom */
		var x;
		var y;
		if (e.pageX != undefined && e.pageY != undefined) {
			x = e.pageX;
			y = e.pageY;
		} else {
			x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		x -= GameUI.m_canvas.offsetLeft;
		y -= GameUI.m_canvas.offsetTop;
		x += (GameUI.m_canvas.offsetLeft - GameUI.m_cubeFrame.get(0).offsetLeft - 10); // 修正 x 坐标
		y -= GameUI.m_marginTop; // 修正 y 坐标
		
		//GameUI.m_debug.html("x: " + x + ", y: " + y + ", col: " + GameUI.m_canvas.offsetLeft + ", fol: " + $("#cubeFrame").get(0).offsetLeft);
		
		if (y > 270)
			return 3;
		else if (y < 90)
			return 0;
		else if (x < 90)
			return 1;
		else
			return 2;
	},
	
	changeMarginTop : function () {
		var game = $("#cubeFrame");
		var gameHeight = game.height();
		var windowHeight = $(window).height();
		GameUI.m_marginTop = (windowHeight - gameHeight) / 3;
		GameUI.m_marginTop = Math.ceil(GameUI.m_marginTop);
		game.css("margin-top", GameUI.m_marginTop + "px");
	},
	
	flashButton : function (btnObj, loop) {
		btnObj.addClass(GameUI.FLASH_BTN_CLASS);
		GameUI.m_curActiveBtn = btnObj;
		GameUI.m_loopFlash = loop;
		setTimeout(function () {
			GameUI.removeBtnActive();
		}, 350);
	},
	
	loopFlash : function () {
		GameUI.m_curActiveBtn.addClass(GameUI.FLASH_BTN_CLASS);
		setTimeout(function () {
			GameUI.removeBtnActive();
		}, 400);
	},
	
	removeBtnActive : function () {
		if (GameUI.m_curActiveBtn) {
			GameUI.m_curActiveBtn.removeClass(GameUI.FLASH_BTN_CLASS);
			/*if (GameUI.m_loopFlash) {
			setTimeout("GameUI.loopFlash()", 350);
			}*/
		}
	},
	
	keyRotate : function () {
		if (GameUI.m_game.IsPaused())
			return;
		GameUI.m_game.KeyRotatePressed();
	},
	
	keyLeft : function () {
		if (GameUI.m_game.IsPaused())
			return;
		GameUI.m_game.KeyLeftPressed();
	},
	
	keyRight : function () {
		if (GameUI.m_game.IsPaused())
			return;
		GameUI.m_game.KeyRightPressed();
	},
	
	keyUp : function () {
		if (GameUI.m_game.IsPaused())
			return;
		GameUI.m_game.KeyUpPressed();
	},
	
	keyDown : function () {
		if (GameUI.m_game.IsPaused())
			return;
		GameUI.m_game.KeyDownPressed();
	},
	
	keyDownToBase : function () {
		if (GameUI.m_game.IsPaused())
			return;
		GameUI.m_game.KeyDownToBasePressed();
	},
	
	mute : function () {
		if (GameUI.m_audio.volume == 0) {
			GameUI.m_audio.volume = 0.1;
			GameUI.m_btnMute.html(GameUI.MUTE_STR);
			localStorage["mute"] = 0;
		} else {
			GameUI.m_audio.volume = 0;
			GameUI.m_btnMute.html(GameUI.NOT_MUTE_STR);
			localStorage["mute"] = 1;
		}
	},
	
	switchToHelp : function () {
		GameUI.m_cubeReel.animate({
			left : "0"
		}, 300);
		GameUI.m_curPage = GameUI.HELP_PAGE;
	},
	
	switchToRank : function (stopped) {
		var rankList = $("#rankList ul");
		rankList.hide();
		var rankNav = $("#rankNav");
		rankNav.html("");
		if (stopped) {
			// 游戏结束进入
			var currentLink = $("<a/>").html("Current");
			currentLink.addClass("linkBtn");
			currentLink.addClass("btnCurrent");
			currentLink.addClass("selected");
			currentLink.attr("href", "#current");
			currentLink.click(function () {
				GameUI.getResult("current")
			});
			rankNav.append(currentLink);
			rankNav.append(" | ");
			// 这里只需要处理 Current，另外两个应该会有统一的函数处理
			rankList.fadeIn();
			var score = parseInt(GameUI.m_curScore);
			var level = parseInt(GameUI.m_curLevel);
			GameUI.m_lastPlayTime = parseInt(GameUI.m_divTime.html());
			var name = localStorage["name"] ? localStorage["name"] : "New Player";
			
			var nameLine = $("#rankList li#list1 .name");
			var resultLine = $("#rankList li#list1 .result");
			nameLine.html("");
			
			var nameInput = $("<input/>");
			nameInput.addClass("inputName").attr({
				type : "text",
				maxlength : "255",
				value : name
			});
			nameInput[0].onkeydown = function (e) {
				GameUI.stopBubble(e);
			}
			var nameSubmit = $("<a/>").html("OK");
			nameSubmit.addClass("linkBtn");
			nameSubmit.addClass("btnNameSub");
			nameSubmit.attr("href", "#");
			nameSubmit.click(function () {
				GameUI.postResult();
			});
			
			nameLine.append(nameInput);
			nameLine.append(nameSubmit);
			nameLine.append("<div class='gameRank'>Rank: <span class='currentRank'></span></div>");
			nameInput.focus();
			
			resultLine.html("Score: " + score + " | Level: " + level + " | Time: " + GameUI.m_lastPlayTime);
			
			GameUI.getRank(score, level, GameUI.m_lastPlayTime);
			
			for (var i = 1; i < 5; ++i) {
				var nameLine = $("#rankList li#list" + (i + 1) + " .name");
				var resultLine = $("#rankList li#list" + (i + 1) + " .result");
				nameLine.html("");
				resultLine.html("");
			}
			
			GameUI.m_lastList = "current";
		}
		
		var totalLink = $("<a/>").html("Total");
		totalLink.addClass("linkBtn");
		totalLink.addClass("btnTotal");
		totalLink.attr("href", "#total");
		totalLink.click(function () {
			GameUI.getResult("total")
		});
		var bestLink = $("<a/>").html("Your Best");
		bestLink.addClass("linkBtn");
		bestLink.addClass("btnBest");
		bestLink.attr("href", "#best");
		bestLink.click(function () {
			GameUI.getResult("best")
		});
		
		rankNav.append(totalLink);
		rankNav.append(" | ");
		rankNav.append(bestLink);
		
		if (!stopped) {
			GameUI.getResult("total");
		}
		
		GameUI.m_cubeReel.animate({
			left : "-290px"
		}, 300);
		GameUI.m_curPage = GameUI.RANK_PAGE;
	},
	
	switchToMenu : function () {
		GameUI.m_cubeReel.animate({
			left : "-580px"
		}, 300);
		GameUI.m_curPage = GameUI.MENU_PAGE;
	},
	
	switchToGame : function () {
		GameUI.m_cubeReel.animate({
			left : "-870px"
		}, 300);
		GameUI.m_curPage = GameUI.GAME_PAGE;
	},
	
	getRank : function (score, level, time) {
		$.ajax({
			type : "GET",
			url : "http://tetris5.sourceforge.net/ajax.php",
			dataType : "jsonp",
			data : {
				"oper" : "rank",
				"score" : score,
				"level" : level,
				"time" : time
			},
			success : function (data) {
				GameUI.m_lastRank = parseInt(data["data"]);
				$(".currentRank").html(GameUI.m_lastRank);
			}
		});
	},
	
	getResult : function (target) {
		var rankList = $("#rankList ul");
		rankList.hide();
		//alert(target);
		
		var btnCurrent = $(".btnCurrent");
		var btnTotal = $(".btnTotal");
		var btnBest = $(".btnBest");
		if (target == "total") {
			btnTotal.addClass("selected");
			btnBest.removeClass("selected");
			btnCurrent.removeClass("selected");
		} else if (target == "best") {
			btnBest.addClass("selected");
			btnTotal.removeClass("selected");
			btnCurrent.removeClass("selected");
		} else if (target == "current") {
			btnCurrent.addClass("selected");
			btnTotal.removeClass("selected");
			btnBest.removeClass("selected");
		}
		
		if (target != "current") {
			if (GameUI.m_lastList == "current") {
				GameUI.postResult();
				GameUI.m_currentList = rankList.html();
			}
			$.ajax({
				type : "GET",
				url : "http://tetris5.sourceforge.net/ajax.php",
				dataType : "jsonp",
				data : {
					oper : target,
					id : GameUI.m_id
				},
				success : function (data) {
					GameUI.displayResult(data);
				}
			});
		} else {
			rankList.html(GameUI.m_currentList);
			$("#rankList ul").fadeIn();
		}
		
		GameUI.m_lastList = target;
	},
	
	displayResult : function (data) {
		//data = $.parseJSON(data);
		if (data == null)
			return;
		var i = 0;
		var len = data.length;
		for (; i < 5; ++i) {
			var nameLine = $("#rankList li#list" + (i + 1) + " .name");
			var resultLine = $("#rankList li#list" + (i + 1) + " .result");
			if (i < len) {
				var result = data[i];
				var name = result.name;
				var rank = result.rank ? result.rank : "";
				var score = result.score;
				var level = result.level;
				var time = result.play_time;
				
				rank = "Rank: " + rank;
				nameLine.html(name + "<div class='gameRank'>" + rank + "</div>");
				resultLine.html("Score: " + score + " | Level: " + level + " | Time: " + time);
			} else {
				nameLine.html("");
				resultLine.html("");
			}
		}
		$("#rankList ul").fadeIn();
	},
	
	postResult : function () {
		var score = parseInt(GameUI.m_curScore);
		var level = parseInt(GameUI.m_curLevel);
		var time = parseInt(GameUI.m_lastPlayTime);
		var name = localStorage["name"] ? localStorage["name"] : "New Player";
		var rank = (GameUI.m_lastRank < 1) ? "" : GameUI.m_lastRank;
		
		var nameInput = $(".inputName");
		if (nameInput.length == 0)
			return;
		var nameLine = $("#rankList li#list1 .name");
		
		name = nameInput.val();
		namehtml = $('<div/>').text(name).html(); // html encode
		localStorage["name"] = name;
		nameLine.html(namehtml + "<div class='gameRank'>Rank: <span class='currentRank'>" + rank + "</span></div>");
		// 然后这里上传数据
		//alert(name + "," + score + "," + level + "," + time);
		$.ajax({
			type : "GET",
			url : "http://tetris5.sourceforge.net/ajax.php",
			dataType : "jsonp",
			data : {
				"oper" : "result",
				"id" : GameUI.m_id,
				"name" : name,
				"score" : score,
				"level" : level,
				"playTime" : time
			}
		});
	},
	
	startGame : function () {
		GameUI.switchToGame();
		GameUI.m_game.Init(GameUI);
		GameUI.m_game.ANI = GameUI.ANI;
		GameUI.m_game.SetAutoUp(0);
		GameUI.m_game.Start();
		GameUI.m_btnPause.html(GameUI.PAUSE_STR);
	},
	
	pauseGame : function () {
		if ((GameUI.m_btnPause.html() == GameUI.PAUSE_STR || GameUI.m_btnPause.html() == GameUI.RESUME_STR) &&
			GameUI.m_game != null && !GameUI.m_game.IsGameOver()) {
			//alert("pause");
			if (GameUI.m_game.IsPaused()) {
				GameUI.switchToGame(); // 先滑动进入，再开始
			}
			GameUI.m_game.Pause();
			if (GameUI.m_game.IsPaused()) {
				GameUI.switchToMenu();
				GameUI.m_btnPause.html(GameUI.RESUME_STR);
				GameUI.saveGame();
			} else {
				GameUI.m_btnPause.html(GameUI.PAUSE_STR);
				//GameUI.m_btnStart.html("Stop");
			}
		}
	},
	
	stopedGame : function () {
		GameUI.switchToRank(true);
		GameUI.m_btnPause.html(GameUI.NOT_RESUME_STR);
		GameUI.clearSavedGame();
	},
	
	// 注意，js 的 paint 不会立即返回
	paint : function () {
		// 绘制游戏内容
		if (GameUI.m_canvasDraw.fillRect) {
			GameUI.m_canvasDraw.fillStyle = "white";
			GameUI.m_canvasDraw.fillRect(0, 0, 180, 360);
			for (var i = 0; i < 10; ++i) {
				GameUI.m_canvasDraw.drawImage(GameUI.m_bkgImg, 0, 0);
			}
		}
		
		var i = 0;
		var j = 19;
		for (; j >= 0; --j) {
			i = 0;
			for (; i < 10; ++i) {
				var curBlock = GameUI.m_gameVector[i][j];
				if (curBlock > 0) {
					if (GameUI.m_canvasDraw.fillRect) {
						//GameUI.m_canvas.fillRect(i * 18, (19 - j) * 18, 17, 17); // 块17px*17px，右边和下边有1px边框
						GameUI.m_canvasDraw.drawImage(GameUI.m_blockImgs[curBlock], i * 18, (19 - j) * 18);
						//GameUI.m_canvasDraw.fillText(curBlock, i * 18, (19 - j) * 18 + 9);
					}
					if (GameUI.m_div.length) {
						GameUI.m_blocks[j][i].addClass("blockColor" + GameUI.m_gameVector[i][j]);
					}
				} else {
					if (GameUI.m_div.length) {
						GameUI.m_blocks[j][i].removeClass("blockColor1");
						GameUI.m_blocks[j][i].removeClass("blockColor2");
						GameUI.m_blocks[j][i].removeClass("blockColor3");
						GameUI.m_blocks[j][i].removeClass("blockColor4");
						GameUI.m_blocks[j][i].removeClass("blockColor5");
					}
				}
			}
		}
		
		if (!GameUI.m_game.isEffecting()) {
			// 不是动画效果时，重绘其他部分
			// Next
			GameUI.m_canvasNext.fillStyle = "white";
			GameUI.m_canvasNext.fillRect(0, 0, 72, 36);
			var nextJson = GameUI.m_game.GetNext();
			var nextArray = nextJson.array;
			var fixX = 0;
			if (nextJson.type >= 2)
				fixX = 9;
			var i = 0;
			var j = 1;
			for (; j >= 0; --j) {
				i = 0;
				for (; i < 4; ++i) {
					if (nextArray[i][j])
						GameUI.m_canvasNext.drawImage(GameUI.m_blockImgs[5], i * 18 + fixX, (1 - j) * 18);
				}
			}
			
			// Score
			if (GameUI.m_curScore != GameUI.m_game.GetScore()) {
				GameUI.m_curScore = GameUI.m_game.GetScore();
				GameUI.m_divScore.animate({
					color : 'white'
				}, 250, function () {
					GameUI.m_divScore.html(GameUI.m_curScore);
					GameUI.m_divScore.animate({
						color : 'black'
					}, 250);
				});
			} else if (GameUI.m_curScore == 0) {
				GameUI.m_divScore.html(GameUI.m_curScore);
			}
			// Level
			if (GameUI.m_curLevel != GameUI.m_game.GetLevel()) {
				GameUI.m_curLevel = GameUI.m_game.GetLevel();
				GameUI.m_divLevel.animate({
					color : 'white'
				}, 250, function () {
					GameUI.m_divLevel.html(GameUI.m_curLevel);
					GameUI.m_divLevel.animate({
						color : 'black'
					}, 250);
				});
			} else if (GameUI.m_curLevel == 0) {
				GameUI.m_divLevel.html(GameUI.m_curLevel);
			}
			// Time
			GameUI.m_divTime.html(GameUI.m_game.GetPlayingTime());
		}
	},
	
	repaint : function () {
		GameUI.m_gameVector = GameUI.m_game.Display();
		GameUI.m_debugui.val(GameUI.m_gameVector);
		
		GameUI.paint();
	},
	
	setAni : function (ani) {
		GameUI.ANI = ani;
	},
	
	dispearLinesEffect : function (queue, beforeDispear, afterAni) {
		GameUI.m_afterAni = afterAni;
		GameUI.m_tempVector = beforeDispear;
		GameUI.m_disQueue = queue;
		GameUI.m_aniCount = 0;
		GameUI.m_timer = setTimeout(function () {
				GameUI.aniDis();
			}, GameUI.ANI_INTERVAL);
	},
	
	aniDis : function () {
		var queueCount = GameUI.m_disQueue.length;
		for (var i = 0; i < queueCount; i++) {
			GameUI.m_tempVector[GameUI.m_aniCount][GameUI.m_disQueue[i]] = 0;
		}
		GameUI.m_gameVector = GameUI.m_tempVector;
		GameUI.paint();
		
		++GameUI.m_aniCount;
		if (GameUI.m_aniCount < 10) {
			GameUI.m_timer = setTimeout(function () {
					GameUI.aniDis();
				}, GameUI.ANI_INTERVAL);
		} else {
			clearTimeout(GameUI.m_timer);
			GameUI.m_afterAni(GameUI.m_disQueue, queueCount);
		}
	},
	
	loadGame : function () {
		if (!Modernizr.localstorage) {
			return false;
		}
		
		if (localStorage["m_cumulativeTime"] > 0) {
			// m_ground : new Array(10), //protected int[][]ground = new int[10][20];
			for (var i = 0; i < 10; ++i) {
				GameUI.m_game.m_ground[i] = new Array(20);
				for (var j = 0; j < 20; ++j) {
					GameUI.m_game.m_ground[i][j] = parseInt(localStorage["m_ground." + i + "." + j]);
				}
			}
			// m_base : new Array(10), //protected int[][]base = new int[10][23];
			for (var i = 0; i < 10; ++i) {
				GameUI.m_game.m_base[i] = new Array(23);
				for (var j = 0; j < 23; ++j) {
					GameUI.m_game.m_base[i][j] = parseInt(localStorage["m_base." + i + "." + j]);
				}
			}
			// m_curBlock :  Block
			// blockType
			// pos.x
			// pos.y
			// style
			var blockPos = new Pos();
			blockPos.x = parseInt(localStorage["m_curBlock.pos.x"]);
			blockPos.y = parseInt(localStorage["m_curBlock.pos.y"]);
			GameUI.m_game.m_curBlock = new Block(parseInt(localStorage["m_curBlock.blockType"]), blockPos);
			GameUI.m_game.m_curBlock.style = parseInt(localStorage["m_curBlock.style"]);
			GameUI.m_game.m_curBlock.color = parseInt(localStorage["m_curBlock.color"]);
			// m_iScore
			GameUI.m_game.m_iScore = parseInt(localStorage["m_iScore"]);
			// m_nLevel
			GameUI.m_game.m_nLevel = parseInt(localStorage["m_nLevel"]);
			// m_nInitLevel
			GameUI.m_game.m_nInitLevel = parseInt(localStorage["m_nInitLevel"]);
			// m_nextType
			GameUI.m_game.m_nextType = parseInt(localStorage["m_nextType"]);
			// m_isAutoUpBase
			GameUI.m_game.m_isAutoUpBase = parseInt(localStorage["m_isAutoUpBase"]);
			// m_curColor
			GameUI.m_game.m_curColor = parseInt(localStorage["m_curColor"]);
			// m_cumulativeTime
			GameUI.m_game.m_cumulativeTime = parseInt(localStorage["m_cumulativeTime"]);
			
			GameUI.m_game.m_gameUI = GameUI;
			GameUI.m_game.m_running = true;
			GameUI.m_game.m_paused = true;
			GameUI.m_game.DownThread();
			
			return true;
		}
		
		return false;
	},
	
	/**
	 * 保存当前游戏
	 */
	saveGame : function () {
		if (!Modernizr.localstorage) {
			return;
		}
		
		//alert("Can save game!");
		// m_ground : new Array(10), //protected int[][]ground = new int[10][20];
		for (var i = 0; i < 10; ++i) {
			for (var j = 0; j < 20; ++j) {
				localStorage["m_ground." + i + "." + j] = GameUI.m_game.m_ground[i][j];
			}
		}
		// m_base : new Array(10), //protected int[][]base = new int[10][23];
		for (var i = 0; i < 10; ++i) {
			for (var j = 0; j < 23; ++j) {
				localStorage["m_base." + i + "." + j] = GameUI.m_game.m_base[i][j];
			}
		}
		// m_curBlock :  Block
		// blockType
		// pos.x
		// pos.y
		// style
		localStorage["m_curBlock.blockType"] = GameUI.m_game.m_curBlock.blockType;
		localStorage["m_curBlock.pos.x"] = GameUI.m_game.m_curBlock.pos.x;
		localStorage["m_curBlock.pos.y"] = GameUI.m_game.m_curBlock.pos.y;
		localStorage["m_curBlock.style"] = GameUI.m_game.m_curBlock.style;
		localStorage["m_curBlock.color"] = GameUI.m_game.m_curBlock.color;
		// m_iScore
		localStorage["m_iScore"] = GameUI.m_game.m_iScore;
		// m_nLevel
		localStorage["m_nLevel"] = GameUI.m_game.m_nLevel;
		// m_nInitLevel
		localStorage["m_nInitLevel"] = GameUI.m_game.m_nInitLevel;
		// m_nextType
		localStorage["m_nextType"] = GameUI.m_game.m_nextType;
		// m_isAutoUpBase
		localStorage["m_isAutoUpBase"] = GameUI.m_game.m_isAutoUpBase;
		// m_curColor
		localStorage["m_curColor"] = GameUI.m_game.m_curColor;
		// m_cumulativeTime
		localStorage["m_cumulativeTime"] = GameUI.m_game.m_cumulativeTime;
	},
	
	clearSavedGame : function () {
		localStorage["m_cumulativeTime"] = -1;
	}
};
