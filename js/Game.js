/* Game.js

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
 * 颜色定义
 * 0 没有
 * 1 白
 * 2 红
 * 3 黄
 * 4 蓝
 * 5 绿
 */

/**
 * @author  Sun Junwen
 */
var Game = {
	
	SCORE_PLUS_1 : 1, //final static int SCORE_PLUS_1 = 1;
	SCORE_PLUS_2 : 3, //final static int SCORE_PLUS_2 = 3;
	SCORE_PLUS_3 : 5, //final static int SCORE_PLUS_3 = 5;
	SCORE_PLUS_4 : 11, //final static int SCORE_PLUS_4 = 11;
	
	LEVEL_SCORE : 100, //final static int LEVEL_SCORE = 100;
	
	DEFAULT_DOWN_INTERVAL : 500,
	DOWN_INTERVAL_CHANGE : 45,
	
	ANI : false, // 是否动画
	
	m_ground : new Array(10), //protected int[][]ground = new int[10][20];
	m_base : new Array(10), //protected int[][]base = new int[10][23];
	
	/**
	 * @uml.property  name="curBlock"
	 * @uml.associationEnd
	 */
	m_curBlock : null, //protected Block curBlock;
	m_running : false, //protected boolean m_running;
	m_paused : false, //protected boolean paused;
	/**
	 * @uml.property  name="effecting"
	 */
	m_effecting : false, //protected boolean effecting;
	m_isGameOver : false, //protected boolean isGameOver;
	m_iScore : 0, //protected int iScore;
	m_nLevel : 0, //protected int nLevel;
	m_nInitLevel : 0, //protected int nInitLevel;
	m_nextType : -1, //protected int nextType;
	m_cheat : false, //protected boolean cheat;
	m_isAutoUpBase : 0, // protected int isAutoUpBase;
	m_curColor : 0, //protected int curColor = 0;
	m_lastTime : 0, // Start Time
	m_cumulativeTime : 0,
	
	/**
	 * @uml.property  name="gameUI"
	 * @uml.associationEnd
	 */
	m_gameUI : null, //protected GameCanvas gameUI = null;
	/**
	 * @uml.property  name="downThread"
	 * @uml.associationEnd
	 */
	m_downTimer : null, //protected DownThread downThread = null;
	/**
	 * @uml.property  name="upBaseThread"
	 * @uml.associationEnd
	 */
	m_upBaseTimer : null, //protected UpBaseThread upBaseThread = null;
	
	m_s : 0, //private int s = 0;
	m_downToBaseInterval : 0, //private long downToBaseInterval = 0;
	
	/**
	 * 新建游戏对象
	 *
	 * @param gameUI
	 *            将游戏绘图对象副，必须继承于 java.awt.Component
	 */
	Init : function (gameUI) {
		Game.m_running = false;
		Game.m_effecting = false;
		Game.m_iScore = 0;
		Game.m_nLevel = 0;
		Game.m_nInitLevel = 0;
		Game.m_nextType = -1;
		Game.m_paused = false;
		Game.m_cheat = false;
		Game.m_isAutoUpBase = 0;
		Game.m_gameUI = gameUI;
		
		for (var i = 0; i < 10; ++i) {
			Game.m_ground[i] = new Array(20);
			Game.m_base[i] = new Array(23);
		}
		
		// srand( (unsigned)time( NULL ) );
		Game.m_curBlock = null;
		for (var i = 0; i < 10; i++) {
			for (var j = 0; j < 23; j++) {
				if (j < 20)
					Game.m_ground[i][j] = 0;
				Game.m_base[i][j] = 0;
			}
		}
		
		// 准备开始的方块样式
		Game.m_nextType = Game.GenType();
		
		/*
		 * // 测试用 for(int i=0;i<10;i++) // 列 { for(int j=0;j<20;j++) // 行 {
		 * if(j==17) base[i][j]=1; else base[i][j]=0; } } // 测试用
		 */
	},
	
	/**
	 * 生成下一个方块的类型
	 *
	 * @return 表示类型的数字
	 */
	GenType : function () {
		var type = -1;
		var rand = -1;
		while (rand < 0 || rand > 19) {
			
			rand = Math.floor((Math.random() * 26) - 5); // ((double)rand() /
			// (RAND_MAX + 1) * 12);
			
		};
		
		switch (rand) {
		case 0:
		case 1:
		case 2:
			type = 6;
			break;
		case 3:
		case 4:
		case 5:
			type = 2;
			break;
		case 6:
		case 7:
		case 8:
			type = 3;
			break;
		case 9:
		case 10:
			type = 1;
			break;
		case 11:
		case 12:
		case 13:
			type = 4;
			break;
		case 14:
		case 15:
		case 16:
			type = 0;
			break;
		case 17:
		case 18:
		case 19:
			type = 5;
			break;
		}
		
		return type;
	},
	
	/**
	 * 生成新的块
	 *
	 * @return true 游戏结束，false 完成
	 */
	NewCurBlock : function () {
		if (Game.m_running && !Game.m_paused) {
			Game.m_effecting = false;
			var stop = false;
			if (Game.m_curBlock != null) {
				if (Game.BlockDownOnBase()) // 失败, 游戏结束
				{
					Game.Stop();
					return true;
				}
				// delete curBlock;
				Game.m_curBlock = null;
			}
			
			var curType = Game.m_nextType;
			Game.m_nextType = -1;
			Game.m_nextType = Game.GenType();
			
			var type = curType;
			
			/*
			 * 0 - 方块 1 - 长条 2 - 三角 3 - 左折角 4 - 右折角 5 - z 字 6 - 反 z 字
			 */
			
			var pos = new Pos();
			
			switch (type) {
			case 0:
				if (Game.m_base[4][19] > 0 || Game.m_base[5][19] > 0 ||
					Game.m_base[4][18] > 0 || Game.m_base[5][18] > 0)
					stop = true;
				pos.x = 4;
				pos.y = 18;
				Game.m_curBlock = new Block(type, pos);
				break;
			case 1:
				if (Game.m_base[3][19] > 0 || Game.m_base[4][19] > 0 ||
					Game.m_base[5][19] > 0 || Game.m_base[6][19] > 0)
					stop = true;
				pos.x = 3;
				pos.y = 19;
				Game.m_curBlock = new Block(type, pos);
				break;
			case 2:
				if (Game.m_base[4][18] > 0 || Game.m_base[3][19] > 0 ||
					Game.m_base[4][19] > 0 || Game.m_base[5][19] > 0)
					stop = true;
				pos.x = 4;
				pos.y = 18;
				Game.m_curBlock = new Block(type, pos);
				break;
			case 3:
				if (Game.m_base[4][18] > 0 || Game.m_base[5][18] > 0 ||
					Game.m_base[6][18] > 0 || Game.m_base[4][19] > 0)
					stop = true;
				pos.x = 4;
				pos.y = 18;
				Game.m_curBlock = new Block(type, pos);
				break;
			case 4:
				if (Game.m_base[4][18] > 0 || Game.m_base[5][18] > 0 ||
					Game.m_base[6][18] > 0 || Game.m_base[6][19] > 0)
					stop = true;
				pos.x = 4;
				pos.y = 18;
				Game.m_curBlock = new Block(type, pos);
				break;
			case 5:
				if (Game.m_base[4][18] > 0 || Game.m_base[5][18] > 0 ||
					Game.m_base[3][19] > 0 || Game.m_base[4][19] > 0)
					stop = true;
				pos.x = 4;
				pos.y = 18;
				Game.m_curBlock = new Block(type, pos);
				break;
			case 6:
				if (Game.m_base[4][18] > 0 || Game.m_base[5][18] > 0 ||
					Game.m_base[5][19] > 0 || Game.m_base[6][19] > 0)
					stop = true;
				pos.x = 4;
				pos.y = 18;
				Game.m_curBlock = new Block(type, pos);
				break;
			}
			
			if (Game.m_curColor >= 0 && Game.m_curColor < 5) {
				Game.m_curColor++;
			} else {
				Game.m_curColor = 1;
			}
			Game.m_curBlock.setColor(Game.m_curColor);
			
			// 重绘
			if (!Game.m_effecting)
				Game.m_gameUI.repaint();
			
			if (stop)
				Game.m_running = false;
			return stop;
			
		}
		return false;
	},
	
	/**
	 * 获得表示当前游戏画面的字符串，'0' 表示该位置没有任何东西，数字表示颜色<br />
	 * 当前对应:<br />
	 * <code>
	 * '1' or default: Red<br />
	 * '2': Yellow<br />
	 * '3': Green<br/>
	 * '4': Orange<br />
	 * '5': Blue<br />
	 * </code>
	 *
	 * @return 字符串
	 */
	Display : function () { // synchronized
		var cubes = "";
		for (var i = 0; i < 10; i++)
			for (var j = 0; j < 20; j++)
				Game.m_ground[i][j] = Game.m_base[i][j];
		
		if (Game.m_curBlock != null && Game.m_running) {
			var type = Game.m_curBlock.GetType(); // 方块种类
			var blockPos = Game.m_curBlock.GetPos(); // 方块定位点的位置
			var style = Game.m_curBlock.GetStyle(); // 方块的形式
			var blockColor = Game.m_curBlock.getColor();
			
			switch (type) // 判断是哪种方块
			{
			case 0: // 方块
				Game.m_ground[blockPos.x][blockPos.y] = blockColor;
				Game.m_ground[blockPos.x + 1][blockPos.y] = blockColor;
				Game.m_ground[blockPos.x][blockPos.y + 1] = blockColor;
				Game.m_ground[blockPos.x + 1][blockPos.y + 1] = blockColor;
				break;
			case 1: // 长条
				switch (style) {
				case 0: // 躺着
					if (blockPos.y < 20) {
						Game.m_ground[blockPos.x][blockPos.y] = blockColor;
						Game.m_ground[blockPos.x + 1][blockPos.y] = blockColor;
						Game.m_ground[blockPos.x + 2][blockPos.y] = blockColor;
						Game.m_ground[blockPos.x + 3][blockPos.y] = blockColor;
					}
					break;
				case 1: // 竖着
					if (blockPos.y < 20)
						Game.m_ground[blockPos.x][blockPos.y] = blockColor;
					if (blockPos.y + 1 < 20)
						Game.m_ground[blockPos.x][blockPos.y + 1] = blockColor;
					if (blockPos.y + 2 < 20)
						Game.m_ground[blockPos.x][blockPos.y + 2] = blockColor;
					if (blockPos.y + 3 < 20)
						Game.m_ground[blockPos.x][blockPos.y + 3] = blockColor;
				}
				break;
			case 2: // 三角
				switch (style) {
				case 0: // 突出在下
					if (blockPos.y < 20)
						Game.m_ground[blockPos.x][blockPos.y] = blockColor;
					if (blockPos.y + 1 < 20) {
						Game.m_ground[blockPos.x - 1][blockPos.y + 1] = blockColor;
						Game.m_ground[blockPos.x][blockPos.y + 1] = blockColor;
						Game.m_ground[blockPos.x + 1][blockPos.y + 1] = blockColor;
					}
					break;
				case 1: // 突出在左
					if (blockPos.y < 20)
						Game.m_ground[blockPos.x][blockPos.y] = blockColor;
					if (blockPos.y + 1 < 20) {
						Game.m_ground[blockPos.x - 1][blockPos.y + 1] = blockColor;
						Game.m_ground[blockPos.x][blockPos.y + 1] = blockColor;
					}
					if (blockPos.y + 2 < 20)
						Game.m_ground[blockPos.x][blockPos.y + 2] = blockColor;
					break;
				case 2: // 突出在上
					if (blockPos.y < 20) {
						Game.m_ground[blockPos.x][blockPos.y] = blockColor;
						Game.m_ground[blockPos.x + 1][blockPos.y] = blockColor;
						Game.m_ground[blockPos.x + 2][blockPos.y] = blockColor;
					}
					if (blockPos.y + 1 < 20)
						Game.m_ground[blockPos.x + 1][blockPos.y + 1] = blockColor;
					break;
				case 3: // 突出在右
					if (blockPos.y < 20)
						Game.m_ground[blockPos.x][blockPos.y] = blockColor;
					if (blockPos.y + 1 < 20) {
						Game.m_ground[blockPos.x + 1][blockPos.y + 1] = blockColor;
						Game.m_ground[blockPos.x][blockPos.y + 1] = blockColor;
					}
					if (blockPos.y + 2 < 20)
						Game.m_ground[blockPos.x][blockPos.y + 2] = blockColor;
					
				}
				break;
			case 3: // 左折角
				switch (style) {
				case 0: // 突出在上
					if (blockPos.y < 20) {
						Game.m_ground[blockPos.x][blockPos.y] = blockColor;
						Game.m_ground[blockPos.x + 1][blockPos.y] = blockColor;
						Game.m_ground[blockPos.x + 2][blockPos.y] = blockColor;
					}
					if (blockPos.y + 1 < 20)
						Game.m_ground[blockPos.x][blockPos.y + 1] = blockColor;
					break;
				case 1: // 突出在右
					if (blockPos.y < 20)
						Game.m_ground[blockPos.x][blockPos.y] = blockColor;
					if (blockPos.y + 1 < 20)
						Game.m_ground[blockPos.x][blockPos.y + 1] = blockColor;
					if (blockPos.y + 2 < 20) {
						Game.m_ground[blockPos.x][blockPos.y + 2] = blockColor;
						Game.m_ground[blockPos.x + 1][blockPos.y + 2] = blockColor;
					}
					break;
				case 2: // 突出在下
					if (blockPos.y < 20)
						Game.m_ground[blockPos.x][blockPos.y] = blockColor;
					if (blockPos.y + 1 < 20) {
						Game.m_ground[blockPos.x][blockPos.y + 1] = blockColor;
						Game.m_ground[blockPos.x - 2][blockPos.y + 1] = blockColor;
						Game.m_ground[blockPos.x - 1][blockPos.y + 1] = blockColor;
					}
					break;
				case 3: // 突出在左
					if (blockPos.y < 20) {
						Game.m_ground[blockPos.x][blockPos.y] = blockColor;
						Game.m_ground[blockPos.x + 1][blockPos.y] = blockColor;
					}
					if (blockPos.y + 1 < 20)
						Game.m_ground[blockPos.x + 1][blockPos.y + 1] = blockColor;
					if (blockPos.y + 2 < 20)
						Game.m_ground[blockPos.x + 1][blockPos.y + 2] = blockColor;
				}
				break;
			case 4: // 右折角
				switch (style) {
				case 0: // 突出在上
					if (blockPos.y < 20) {
						Game.m_ground[blockPos.x][blockPos.y] = blockColor;
						Game.m_ground[blockPos.x + 1][blockPos.y] = blockColor;
						Game.m_ground[blockPos.x + 2][blockPos.y] = blockColor;
					}
					if (blockPos.y + 1 < 20)
						Game.m_ground[blockPos.x + 2][blockPos.y + 1] = blockColor;
					break;
				case 1: // 突出在右
					if (blockPos.y < 20) {
						Game.m_ground[blockPos.x][blockPos.y] = blockColor;
						Game.m_ground[blockPos.x + 1][blockPos.y] = blockColor;
					}
					if (blockPos.y + 1 < 20)
						Game.m_ground[blockPos.x][blockPos.y + 1] = blockColor;
					if (blockPos.y + 2 < 20)
						Game.m_ground[blockPos.x][blockPos.y + 2] = blockColor;
					break;
				case 2: // 突出在下
					if (blockPos.y < 20)
						Game.m_ground[blockPos.x][blockPos.y] = blockColor;
					if (blockPos.y + 1 < 20) {
						Game.m_ground[blockPos.x][blockPos.y + 1] = blockColor;
						Game.m_ground[blockPos.x + 1][blockPos.y + 1] = blockColor;
						Game.m_ground[blockPos.x + 2][blockPos.y + 1] = blockColor;
					}
					break;
				case 3: // 突出在左
					if (blockPos.y < 20)
						Game.m_ground[blockPos.x][blockPos.y] = blockColor;
					if (blockPos.y + 1 < 20)
						Game.m_ground[blockPos.x][blockPos.y + 1] = blockColor;
					if (blockPos.y + 2 < 20) {
						Game.m_ground[blockPos.x][blockPos.y + 2] = blockColor;
						Game.m_ground[blockPos.x - 1][blockPos.y + 2] = blockColor;
					}
				}
				break;
			case 5: // z 字
				switch (style) {
				case 0: // 躺着
					if (blockPos.y < 20) {
						Game.m_ground[blockPos.x][blockPos.y] = blockColor;
						Game.m_ground[blockPos.x + 1][blockPos.y] = blockColor;
					}
					if (blockPos.y + 1 < 20) {
						Game.m_ground[blockPos.x - 1][blockPos.y + 1] = blockColor;
						Game.m_ground[blockPos.x][blockPos.y + 1] = blockColor;
					}
					break;
				case 1: // 竖着
					if (blockPos.y < 20)
						Game.m_ground[blockPos.x][blockPos.y] = blockColor;
					if (blockPos.y + 1 < 20) {
						Game.m_ground[blockPos.x][blockPos.y + 1] = blockColor;
						Game.m_ground[blockPos.x + 1][blockPos.y + 1] = blockColor;
					}
					if (blockPos.y + 2 < 20)
						Game.m_ground[blockPos.x + 1][blockPos.y + 2] = blockColor;
					break;
				}
				break;
			case 6: // 反 z 字
				switch (style) {
				case 0: // 躺着
					if (blockPos.y < 20) {
						Game.m_ground[blockPos.x][blockPos.y] = blockColor;
						Game.m_ground[blockPos.x + 1][blockPos.y] = blockColor;
					}
					if (blockPos.y + 1 < 20) {
						Game.m_ground[blockPos.x + 1][blockPos.y + 1] = blockColor;
						Game.m_ground[blockPos.x + 2][blockPos.y + 1] = blockColor;
					}
					break;
				case 1: // 竖着
					if (blockPos.y < 20)
						Game.m_ground[blockPos.x][blockPos.y] = blockColor;
					if (blockPos.y + 1 < 20) {
						Game.m_ground[blockPos.x - 1][blockPos.y + 1] = blockColor;
						Game.m_ground[blockPos.x][blockPos.y + 1] = blockColor;
					}
					if (blockPos.y + 2 < 20)
						Game.m_ground[blockPos.x - 1][blockPos.y + 2] = blockColor;
					break;
				}
				break;
			}
			
		}
		return Game.m_ground;
	},
	
	/**
	 * 方块水平移动
	 *
	 * @param x
	 *            移动位置量
	 * @return true 阻止，false 完成
	 */
	BlockHMove : function (x) { // synchronized
		if (Game.m_curBlock != null && Game.m_running && !Game.m_paused && !Game.m_effecting) {
			var type = Game.m_curBlock.GetType(); // 方块种类
			var curPos = Game.m_curBlock.GetPos(); // 方块定位点现在的位置
			var style = Game.m_curBlock.GetStyle(); // 方块的形式
			
			var left = false;
			var abs_x = x;
			var i;
			if (x < 0) {
				left = true;
				abs_x = -x;
			}
			
			newPos = new Pos();
			newPos.x = curPos.x;
			newPos.y = curPos.y;
			for (i = 0; i < abs_x; i++) {
				
				if (left)
					newPos.x -= 1;
				else
					newPos.x += 1;
				
				switch (type) // 判断是哪种方块
				{
				case 0: // 方块
					if (newPos.x >= 0 && (newPos.x + 1) <= 9) {
						if (!(Game.m_base[newPos.x][newPos.y] == 0 && Game.m_base[newPos.x][newPos.y + 1] == 0 &&
								Game.m_base[newPos.x + 1][newPos.y] == 0 && Game.m_base[newPos.x + 1][newPos.y + 1] == 0))
							return true;
					} else
						return true;
					break;
				case 1: // 长条
					switch (style) {
					case 0: // 躺着
						if (newPos.x >= 0 && (newPos.x + 3) <= 9) {
							if (!(Game.m_base[newPos.x][newPos.y] == 0 && Game.m_base[newPos.x + 3][newPos.y] == 0))
								return true;
						} else
							return true;
						break;
					case 1: // 竖着
						if (newPos.x >= 0 && newPos.x <= 9) {
							if (!(Game.m_base[newPos.x][newPos.y] == 0 && Game.m_base[newPos.x][newPos.y + 1] == 0 &&
									Game.m_base[newPos.x][newPos.y + 2] == 0 && Game.m_base[newPos.x][newPos.y + 3] == 0))
								return true;
						} else
							return true;
					}
					break;
				case 2: // 三角
					switch (style) {
					case 0: // 突出在下
						if ((newPos.x - 1) >= 0 && (newPos.x + 1) <= 9) {
							if (!(Game.m_base[newPos.x][newPos.y] == 0 && Game.m_base[newPos.x - 1][newPos.y + 1] == 0 &&
									Game.m_base[newPos.x + 1][newPos.y + 1] == 0))
								return true;
						} else
							return true;
						break;
					case 1: // 突出在左
						if ((newPos.x - 1) >= 0 && newPos.x <= 9) {
							if (!(Game.m_base[newPos.x][newPos.y] == 0 && Game.m_base[newPos.x - 1][newPos.y + 1] == 0 &&
									Game.m_base[newPos.x][newPos.y + 1] == 0 && Game.m_base[newPos.x][newPos.y + 2] == 0))
								return true;
						} else
							return true;
						break;
					case 2: // 突出在上
						if (newPos.x >= 0 && (newPos.x + 2) <= 9) {
							if (!(Game.m_base[newPos.x][newPos.y] == 0 && Game.m_base[newPos.x + 1][newPos.y + 1] == 0 &&
									Game.m_base[newPos.x + 2][newPos.y] == 0))
								return true;
						} else
							return true;
						break;
					case 3: // 突出在右
						if (newPos.x >= 0 && (newPos.x + 1) <= 9) {
							if (!(Game.m_base[newPos.x][newPos.y] == 0 && Game.m_base[newPos.x][newPos.y + 1] == 0 &&
									Game.m_base[newPos.x + 1][newPos.y + 1] == 0 && Game.m_base[newPos.x][newPos.y + 2] == 0))
								return true;
						} else
							return true;
					}
					break;
				case 3: // 左折角
					switch (style) {
					case 0: // 突出在上
						if (newPos.x >= 0 && (newPos.x + 2) <= 9) {
							if (!(Game.m_base[newPos.x][newPos.y] == 0 && Game.m_base[newPos.x][newPos.y + 1] == 0 &&
									Game.m_base[newPos.x + 2][newPos.y] == 0))
								return true;
						} else
							return true;
						break;
					case 1: // 突出在右
						if (newPos.x >= 0 && (newPos.x + 1) <= 9) {
							if (!(Game.m_base[newPos.x][newPos.y] == 0 && Game.m_base[newPos.x][newPos.y + 1] == 0 &&
									Game.m_base[newPos.x][newPos.y + 2] == 0 && Game.m_base[newPos.x + 1][newPos.y + 2] == 0))
								return true;
						} else
							return true;
						break;
					case 2: // 突出在下
						if ((newPos.x - 2) >= 0 && newPos.x <= 9) {
							if (!(Game.m_base[newPos.x][newPos.y] == 0 && Game.m_base[newPos.x][newPos.y + 1] == 0 &&
									Game.m_base[newPos.x - 2][newPos.y + 1] == 0))
								return true;
						} else
							return true;
						break;
					case 3: // 突出在左
						if (newPos.x >= 0 && (newPos.x + 1) <= 9) {
							if (!(Game.m_base[newPos.x][newPos.y] == 0 && Game.m_base[newPos.x + 1][newPos.y] == 0 &&
									Game.m_base[newPos.x + 1][newPos.y + 1] == 0 && Game.m_base[newPos.x + 1][newPos.y + 2] == 0))
								return true;
						} else
							return true;
					}
					break;
				case 4: // 右折角
					switch (style) {
					case 0: // 突出在上
						if (newPos.x >= 0 && (newPos.x + 2) <= 9) {
							if (!(Game.m_base[newPos.x][newPos.y] == 0 && Game.m_base[newPos.x + 2][newPos.y] == 0 &&
									Game.m_base[newPos.x + 2][newPos.y + 1] == 0))
								return true;
						} else
							return true;
						break;
					case 1: // 突出在右
						if (newPos.x >= 0 && (newPos.x + 1) <= 9) {
							if (!(Game.m_base[newPos.x][newPos.y] == 0 && Game.m_base[newPos.x][newPos.y + 1] == 0 &&
									Game.m_base[newPos.x][newPos.y + 2] == 0 && Game.m_base[newPos.x + 1][newPos.y] == 0))
								return true;
						} else
							return true;
						break;
					case 2: // 突出在下
						if (newPos.x >= 0 && (newPos.x + 2) <= 9) {
							if (!(Game.m_base[newPos.x][newPos.y] == 0 && Game.m_base[newPos.x][newPos.y + 1] == 0 &&
									Game.m_base[newPos.x + 2][newPos.y + 1] == 0))
								return true;
						} else
							return true;
						break;
					case 3: // 突出在左
						if ((newPos.x - 1) >= 0 && newPos.x <= 9) {
							if (!(Game.m_base[newPos.x][newPos.y] == 0 && Game.m_base[newPos.x][newPos.y + 1] == 0 &&
									Game.m_base[newPos.x][newPos.y + 2] == 0 && Game.m_base[newPos.x - 1][newPos.y + 2] == 0))
								return true;
						} else
							return true;
					}
					break;
				case 5: // z 字
					switch (style) {
					case 0: // 躺着
						if ((newPos.x - 1) >= 0 && (newPos.x + 1) <= 9) {
							if (!(Game.m_base[newPos.x][newPos.y] == 0 && Game.m_base[newPos.x][newPos.y + 1] == 0 &&
									Game.m_base[newPos.x - 1][newPos.y + 1] == 0 && Game.m_base[newPos.x + 1][newPos.y] == 0))
								return true;
						} else {
							return true;
						}
						break;
					case 1: // 竖着
						if (newPos.x >= 0 && (newPos.x + 1) <= 9) {
							if (!(Game.m_base[newPos.x][newPos.y] == 0 && Game.m_base[newPos.x][newPos.y + 1] == 0 &&
									Game.m_base[newPos.x + 1][newPos.y + 1] == 0 && Game.m_base[newPos.x + 1][newPos.y + 2] == 0))
								return true;
						} else
							return true;
						break;
					}
					break;
				case 6: // 反 z 字
					switch (style) {
					case 0: // 躺着
						if (newPos.x >= 0 && (newPos.x + 2) <= 9) {
							if (!(Game.m_base[newPos.x][newPos.y] == 0 && Game.m_base[newPos.x + 1][newPos.y] == 0 &&
									Game.m_base[newPos.x + 1][newPos.y + 1] == 0 && Game.m_base[newPos.x + 2][newPos.y + 1] == 0))
								return true;
						} else
							return true;
						break;
					case 1: // 竖着
						if ((newPos.x - 1) >= 0 && newPos.x <= 9) {
							if (!(Game.m_base[newPos.x][newPos.y] == 0 && Game.m_base[newPos.x][newPos.y + 1] == 0 &&
									Game.m_base[newPos.x - 1][newPos.y + 1] == 0 && Game.m_base[newPos.x - 1][newPos.y + 2] == 0))
								return true;
						} else {
							return true;
						}
						break;
					}
					break;
				}
			}
			if (i == abs_x) {
				Game.m_curBlock.MoveX(x);
				return false;
			} else
				return true;
		}
		
		return true;
		
	},
	
	/**
	 * 方块垂直移动
	 *
	 * @param y
	 *            移动距离
	 * @return true 阻止，false 完成
	 */
	BlockVMove : function (y) { // synchronized
		if (Game.m_curBlock != null && Game.m_running && !Game.m_paused && !Game.m_effecting) {
			var type = Game.m_curBlock.GetType(); // 方块种类
			var curPos = Game.m_curBlock.GetPos(); // 方块定位点现在的位置
			var style = Game.m_curBlock.GetStyle(); // 方块的形式
			
			var newPos = new Pos(); // curPos.;
			newPos.x = curPos.x;
			newPos.y = curPos.y;
			
			newPos.y += y;
			if (newPos.y < 0)
				return true;
			
			switch (type) // 判断是哪种方块
			{
			case 0: // 方块
				if (Game.m_base[newPos.x][newPos.y] == 0
					 && Game.m_base[newPos.x + 1][newPos.y] == 0) {
					Game.m_curBlock.Down();
					return false;
				} else
					return true;
				
			case 1: // 长条
				switch (style) {
				case 0: // 躺着
					if (Game.m_base[newPos.x][newPos.y] == 0
						 && Game.m_base[newPos.x + 1][newPos.y] == 0
						 && Game.m_base[newPos.x + 2][newPos.y] == 0
						 && Game.m_base[newPos.x + 3][newPos.y] == 0) {
						Game.m_curBlock.Down();
						return false;
					} else
						return true;
					
				case 1: // 竖着
					if (Game.m_base[newPos.x][newPos.y] == 0) {
						Game.m_curBlock.Down();
						return false;
					} else
						return true;
				}
				break;
			case 2: // 三角
				switch (style) {
				case 0: // 突出在下
					if (Game.m_base[newPos.x][newPos.y] == 0
						 && Game.m_base[newPos.x - 1][newPos.y + 1] == 0
						 && Game.m_base[newPos.x + 1][newPos.y + 1] == 0) {
						Game.m_curBlock.Down();
						return false;
					} else
						return true;
					
				case 1: // 突出在左
					if (Game.m_base[newPos.x][newPos.y] == 0
						 && Game.m_base[newPos.x - 1][newPos.y + 1] == 0) {
						Game.m_curBlock.Down();
						return false;
					} else
						return true;
					
				case 2: // 突出在上
					if (Game.m_base[newPos.x][newPos.y] == 0
						 && Game.m_base[newPos.x + 1][newPos.y] == 0
						 && Game.m_base[newPos.x + 2][newPos.y] == 0) {
						Game.m_curBlock.Down();
						return false;
					} else
						return true;
					
				case 3: // 突出在右
					if (Game.m_base[newPos.x][newPos.y] == 0
						 && Game.m_base[newPos.x + 1][newPos.y + 1] == 0) {
						Game.m_curBlock.Down();
						return false;
					} else
						return true;
				}
				break;
			case 3: // 左折角
				switch (style) {
				case 0: // 突出在上
					if (Game.m_base[newPos.x][newPos.y] == 0
						 && Game.m_base[newPos.x + 1][newPos.y] == 0
						 && Game.m_base[newPos.x + 2][newPos.y] == 0) {
						Game.m_curBlock.Down();
						return false;
					} else
						return true;
					
				case 1: // 突出在右
					if (Game.m_base[newPos.x][newPos.y] == 0
						 && Game.m_base[newPos.x + 1][newPos.y + 2] == 0) {
						Game.m_curBlock.Down();
						return false;
					} else
						return true;
					
				case 2: // 突出在下
					if (Game.m_base[newPos.x][newPos.y] == 0
						 && Game.m_base[newPos.x - 1][newPos.y + 1] == 0
						 && Game.m_base[newPos.x - 2][newPos.y + 1] == 0) {
						Game.m_curBlock.Down();
						return false;
					} else
						return true;
					
				case 3: // 突出在左
					if (Game.m_base[newPos.x][newPos.y] == 0
						 && Game.m_base[newPos.x + 1][newPos.y] == 0) {
						Game.m_curBlock.Down();
						return false;
					} else
						return true;
				}
				break;
			case 4: // 右折角
				switch (style) {
				case 0: // 突出在上
					if (Game.m_base[newPos.x][newPos.y] == 0
						 && Game.m_base[newPos.x + 1][newPos.y] == 0
						 && Game.m_base[newPos.x + 2][newPos.y] == 0) {
						Game.m_curBlock.Down();
						return false;
					} else
						return true;
					
				case 1: // 突出在右
					if (Game.m_base[newPos.x][newPos.y] == 0
						 && Game.m_base[newPos.x + 1][newPos.y] == 0) {
						Game.m_curBlock.Down();
						return false;
					} else
						return true;
					
				case 2: // 突出在下
					if (Game.m_base[newPos.x][newPos.y] == 0
						 && Game.m_base[newPos.x + 1][newPos.y + 1] == 0
						 && Game.m_base[newPos.x + 2][newPos.y + 1] == 0) {
						Game.m_curBlock.Down();
						return false;
					} else
						return true;
					
				case 3: // 突出在左
					if (Game.m_base[newPos.x][newPos.y] == 0
						 && Game.m_base[newPos.x - 1][newPos.y + 2] == 0) {
						Game.m_curBlock.Down();
						return false;
					} else
						return true;
				}
				break;
			case 5: // z 字
				switch (style) {
				case 0: // 躺着
					if (Game.m_base[newPos.x][newPos.y] == 0
						 && Game.m_base[newPos.x + 1][newPos.y] == 0
						 && Game.m_base[newPos.x - 1][newPos.y + 1] == 0) {
						Game.m_curBlock.Down();
						return false;
					} else
						return true;
					
				case 1: // 竖着
					if (Game.m_base[newPos.x][newPos.y] == 0
						 && Game.m_base[newPos.x + 1][newPos.y + 1] == 0) {
						Game.m_curBlock.Down();
						return false;
					} else
						return true;
					
				}
				break;
			case 6: // 反 z 字
				switch (style) {
				case 0: // 躺着
					if (Game.m_base[newPos.x][newPos.y] == 0
						 && Game.m_base[newPos.x + 1][newPos.y] == 0
						 && Game.m_base[newPos.x + 2][newPos.y + 1] == 0) {
						Game.m_curBlock.Down();
						return false;
					} else
						return true;
					
				case 1: // 竖着
					if (Game.m_base[newPos.x][newPos.y] == 0
						 && Game.m_base[newPos.x - 1][newPos.y + 1] == 0) {
						Game.m_curBlock.Down();
						return false;
					} else
						return true;
					
				}
				break;
			}
		}
		return true;
	},
	
	/**
	 * 方块旋转
	 *
	 * @return true 没有旋转，false 旋转了
	 */
	BlockRotate : function () { // synchronized
		if (Game.m_curBlock != null && Game.m_running && !Game.m_paused && !Game.m_effecting) {
			var type = Game.m_curBlock.GetType(); // 方块种类
			var curPos = Game.m_curBlock.GetPos(); // 方块定位点现在的位置
			var style = Game.m_curBlock.GetStyle(); // 方块的形式
			
			switch (type) // 判断是哪种方块
			{
			case 0: // 方块
				return true;
				
			case 1: // 长条
				switch (style) // 现在的形式
				{
				case 0: // 躺着
					if (Game.m_base[curPos.x + 1][curPos.y + 1] > 0
						 || Game.m_base[curPos.x + 1][curPos.y + 2] > 0
						 || Game.m_base[curPos.x + 1][curPos.y + 3] > 0) {
						return true;
					} else {
						// m_curBlock->pos.x+=1;
						Game.m_curBlock.MoveX(1);
						Game.m_curBlock.Rotate();
						return false;
					}
					
				case 1: // 竖着
					if (curPos.x + 1 > 9 || Game.m_base[curPos.x + 1][curPos.y] > 0) {
						if (Game.BlockHMove(-3))
							return true;
						Game.m_curBlock.Rotate();
						
						return false;
					} else if (curPos.x + 2 > 9
						 || Game.m_base[curPos.x + 2][curPos.y] > 0) {
						if (Game.BlockHMove(-2))
							return true;
						Game.m_curBlock.Rotate();
						
						return false;
					} else if (curPos.x + 3 > 9
						 || Game.m_base[curPos.x + 3][curPos.y] > 0) {
						if (Game.BlockHMove(-1))
							return true;
						Game.m_curBlock.Rotate();
						
						return false;
					} else if (curPos.x - 1 < 0
						 || Game.m_base[curPos.x - 1][curPos.y] > 0) {
						if (Game.BlockHMove(3))
							return true;
						// curBlock->pos.x-=3;
						Game.m_curBlock.MoveX(-3);
						Game.m_curBlock.Rotate();
						return false;
					} else {
						if (Game.BlockHMove(-1))
							return true;
						Game.m_curBlock.Rotate();
						return false;
					}
				}
			case 2: // 三角
				switch (style) // 现在的形式
				{
				case 0: // 突出在下
					if (Game.m_base[curPos.x][curPos.y + 2] > 0)
						return true;
					else {
						Game.m_curBlock.Rotate();
						return false;
					}
					
				case 1: // 突出在左
					if (curPos.x + 1 > 9
						 || (Game.m_base[curPos.x + 1][curPos.y] > 0
							 || Game.m_base[curPos.x + 1][curPos.y + 1] > 0 || Game.m_base[curPos.x + 1][curPos.y + 2] > 0)) // 右边有冲突
					{
						if (Game.BlockHMove(-1))
							return true;
						// curBlock->pos.x-=1;
						Game.m_curBlock.MoveX(-1);
						Game.m_curBlock.Rotate();
						return false;
					} else if (Game.m_base[curPos.x - 1][curPos.y] > 0) // 左边有冲突
					{
						if (Game.BlockHMove(1))
							return true;
						// curBlock->pos.x-=1;
						Game.m_curBlock.MoveX(-1);
						Game.m_curBlock.Rotate();
						return false;
					} else {
						// curBlock->pos.x-=1;
						Game.m_curBlock.MoveX(-1);
						Game.m_curBlock.Rotate();
						return false;
					}
					
				case 2: // 突出在上
					if (Game.m_base[curPos.x + 1][curPos.y + 2] > 0
						 || Game.m_base[curPos.x + 2][curPos.y + 1] > 0)
						return true;
					// curBlock.pos.x+=1;
					Game.m_curBlock.MoveX(1);
					Game.m_curBlock.Rotate();
					return false;
					
				case 3: // 突出在右
					if (curPos.x - 1 < 0
						 || Game.m_base[curPos.x - 1][curPos.y + 1] > 0) {
						if (Game.BlockHMove(1))
							return true;
						Game.m_curBlock.Rotate();
						return false;
					} else {
						Game.m_curBlock.Rotate();
						return false;
					}
				}
				break;
			case 3: // 左折角
				switch (style) // 现在的形式
				{
				case 0: // 突出在上
					if (Game.m_base[curPos.x + 1][curPos.y + 1] > 0
						 || Game.m_base[curPos.x + 1][curPos.y + 2] > 0
						 || Game.m_base[curPos.x + 2][curPos.y + 2] > 0)
						return true;
					else {
						Game.m_curBlock.Rotate();
						// curBlock.pos.x+=1;
						Game.m_curBlock.MoveX(1);
						return false;
					}
					
				case 1: // 突出在右
					if (curPos.x - 1 < 0
						 || (Game.m_base[curPos.x - 1][curPos.y + 1] > 0 || Game.m_base[curPos.x - 1][curPos.y] > 0)) // 左边冲突
					{
						if (Game.BlockHMove(1))
							return true;
						curPos = Game.m_curBlock.GetPos();
						if (Game.m_base[curPos.x + 1][curPos.y] > 0
							 || Game.m_base[curPos.x + 1][curPos.y + 1] > 0) {
							Game.BlockHMove(-1);
							return true;
						}
						Game.m_curBlock.Rotate();
						Game.m_curBlock.MoveX(1);
						return false;
					} else if (Game.m_base[curPos.x + 1][curPos.y] > 0
						 || Game.m_base[curPos.x + 1][curPos.y + 1] > 0) // 右边冲突
						return true;
					else {
						Game.m_curBlock.Rotate();
						// curBlock.pos.x+=1;
						Game.m_curBlock.MoveX(1);
						return false;
					}
					
				case 2: // 突出在下
					if (Game.m_base[curPos.x - 1][curPos.y] > 0
						 || Game.m_base[curPos.x - 1][curPos.y + 2] > 0
						 || Game.m_base[curPos.x - 2][curPos.y] > 0
						 || Game.m_base[curPos.x - 2][curPos.y + 2] > 0)
						return true;
					else {
						Game.m_curBlock.Rotate();
						// curBlock.pos.x-=2;
						Game.m_curBlock.MoveX(-2);
						return false;
					}
					
				case 3: // 突出在左
					if (curPos.x + 2 > 9
						 || (Game.m_base[curPos.x + 2][curPos.y] > 0
							 || Game.m_base[curPos.x + 2][curPos.y + 1] > 0 || Game.m_base[curPos.x + 2][curPos.y + 2] > 0)) // 右边冲突
					{
						if (Game.BlockHMove(-1))
							return true;
						curPos = Game.m_curBlock.GetPos();
						if (Game.m_base[curPos.x][curPos.y + 1] > 0) {
							Game.BlockHMove(1);
							return true;
						}
						Game.m_curBlock.Rotate();
					} else if (Game.m_base[curPos.x][curPos.y + 1] > 0)
						return true;
					else {
						Game.m_curBlock.Rotate();
						return false;
					}
				}
				break;
			case 4: // 右折角
				switch (style) // 现在的形式
				{
				case 0: // 突出在上
					if (Game.m_base[curPos.x + 1][curPos.y + 1] > 0
						 || Game.m_base[curPos.x + 1][curPos.y + 2] > 0)
						return true;
					else {
						Game.m_curBlock.Rotate();
						// curBlock.pos.x+=1;
						Game.m_curBlock.MoveX(1);
						return false;
					}
					
				case 1: // 突出在右
					if (curPos.x - 1 < 0
						 || (Game.m_base[curPos.x - 1][curPos.y + 1] > 0 || Game.m_base[curPos.x - 1][curPos.y] > 0)) // 左边冲突
					{
						if (Game.BlockHMove(1))
							return true;
						curPos = Game.m_curBlock.GetPos();
						if (Game.m_base[curPos.x + 1][curPos.y + 1] > 0) {
							Game.BlockHMove(-1);
							return true;
						}
						Game.m_curBlock.Rotate();
						Game.m_curBlock.MoveX(-1);
						return false;
					} else if (Game.m_base[curPos.x + 1][curPos.y + 1] > 0) // 右边冲突
						return true;
					else {
						Game.m_curBlock.Rotate();
						// curBlock.pos.x-=1;
						Game.m_curBlock.MoveX(-1);
						return false;
					}
					
				case 2: // 突出在下
					if (Game.m_base[curPos.x][curPos.y + 2] > 0
						 || Game.m_base[curPos.x + 1][curPos.y] > 0
						 || Game.m_base[curPos.x + 1][curPos.y + 2] > 0
						 || Game.m_base[curPos.x + 2][curPos.y] > 0)
						return true;
					else {
						Game.m_curBlock.Rotate();
						// curBlock.pos.x+=1;
						Game.m_curBlock.MoveX(1);
						return false;
					}
					
				case 3: // 突出在左
					if (curPos.x + 2 > 9
						 || (Game.m_base[curPos.x + 1][curPos.y] > 0
							 || Game.m_base[curPos.x + 1][curPos.y + 1] > 0 || Game.m_base[curPos.x + 1][curPos.y + 2] > 0)) // 右边冲突
					{
						if (Game.BlockHMove(-1))
							return true;
						curPos = Game.m_curBlock.GetPos();
						if (Game.m_base[curPos.x - 1][curPos.y] > 0) {
							Game.BlockHMove(1);
							return true;
						}
						Game.m_curBlock.Rotate();
						Game.m_curBlock.MoveX(-1);
					} else if (Game.m_base[curPos.x - 1][curPos.y] > 0)
						return true;
					else {
						Game.m_curBlock.Rotate();
						// curBlock.pos.x-=1;
						Game.m_curBlock.MoveX(-1);
						return false;
					}
				}
				break;
			case 5: // z 字
				switch (style) {
				case 0: // 躺着
					if (Game.m_base[curPos.x + 1][curPos.y + 1] > 0
						 || Game.m_base[curPos.x + 1][curPos.y + 2] > 0)
						return true;
					else {
						Game.m_curBlock.Rotate();
						return false;
					}
					
				case 1: // 竖着
					if (curPos.x - 1 < 0
						 || (Game.m_base[curPos.x - 1][curPos.y] > 0 || Game.m_base[curPos.x - 1][curPos.y + 1] > 0)) // 左边有冲突
					{
						if (Game.BlockHMove(1))
							return true;
						curPos = Game.m_curBlock.GetPos();
						if (Game.m_base[curPos.x + 1][curPos.y] > 0) {
							Game.BlockHMove(-1);
							return true;
						}
						Game.m_curBlock.Rotate();
						return false;
					} else if (Game.m_base[curPos.x + 1][curPos.y] > 0) // 右边有冲突
					{
						return true;
					} else {
						Game.m_curBlock.Rotate();
						return false;
					}
					
				}
				break;
			case 6: // 反 z 字
				switch (style) {
				case 0: // 躺着
					if (Game.m_base[curPos.x][curPos.y + 1] > 0
						 || Game.m_base[curPos.x][curPos.y + 2] > 0)
						return true;
					else {
						Game.m_curBlock.Rotate();
						Game.m_curBlock.MoveX(1);
						return false;
					}
					
				case 1: // 竖着
					if (curPos.x + 1 > 9
						 || (Game.m_base[curPos.x + 1][curPos.y] > 0 || Game.m_base[curPos.x + 1][curPos.y + 1] > 0)) // 右边有冲突
					{
						if (Game.BlockHMove(-1))
							return true;
						curPos = Game.m_curBlock.GetPos();
						if (Game.m_base[curPos.x - 1][curPos.y] > 0) {
							Game.BlockHMove(1);
							return true;
						}
						Game.m_curBlock.Rotate();
						Game.m_curBlock.MoveX(-1);
						return false;
					} else if (Game.m_base[curPos.x - 1][curPos.y] > 0) // 右边有冲突
					{
						return true;
					} else {
						Game.m_curBlock.Rotate();
						Game.m_curBlock.MoveX(-1);
						return false;
					}
					
				}
				break;
			}
		}
		
		return false;
	},
	
	/**
	 * 将方块放入底部
	 *
	 * @return true 阻止，游戏结束；false 完成
	 */
	BlockDownOnBase : function () { // synchronized
		if (Game.m_curBlock != null && Game.m_running && !Game.m_paused && !Game.m_effecting) {
			var type = Game.m_curBlock.GetType(); // 方块种类
			var blockPos = Game.m_curBlock.GetPos(); // 方块定位点的位置
			var style = Game.m_curBlock.GetStyle(); // 方块的形式
			var blockColor = Game.m_curBlock.getColor(); // 方块的颜色
			
			switch (type) // 判断是哪种方块
			{
			case 0: // 方块
				if (blockPos.y < 20) {
					Game.m_base[blockPos.x][blockPos.y] = blockColor;
					Game.m_base[blockPos.x + 1][blockPos.y] = blockColor;
				} else
					return true;
				if (blockPos.y + 1 < 20) {
					Game.m_base[blockPos.x][blockPos.y + 1] = blockColor;
					Game.m_base[blockPos.x + 1][blockPos.y + 1] = blockColor;
				} else
					return true;
				break;
			case 1: // 长条
				switch (style) {
				case 0: // 躺着
					if (blockPos.y < 20) {
						Game.m_base[blockPos.x][blockPos.y] = blockColor;
						Game.m_base[blockPos.x + 1][blockPos.y] = blockColor;
						Game.m_base[blockPos.x + 2][blockPos.y] = blockColor;
						Game.m_base[blockPos.x + 3][blockPos.y] = blockColor;
					} else
						return true;
					break;
				case 1: // 竖着
					if (blockPos.y < 20)
						Game.m_base[blockPos.x][blockPos.y] = blockColor;
					else
						return true;
					if (blockPos.y + 1 < 20)
						Game.m_base[blockPos.x][blockPos.y + 1] = blockColor;
					else
						return true;
					if (blockPos.y + 2 < 20)
						Game.m_base[blockPos.x][blockPos.y + 2] = blockColor;
					else
						return true;
					if (blockPos.y + 3 < 20)
						Game.m_base[blockPos.x][blockPos.y + 3] = blockColor;
					else
						return true;
				}
				break;
			case 2: // 三角
				switch (style) {
				case 0: // 突出在下
					if (blockPos.y < 20)
						Game.m_base[blockPos.x][blockPos.y] = blockColor;
					else
						return true;
					if (blockPos.y + 1 < 20) {
						Game.m_base[blockPos.x - 1][blockPos.y + 1] = blockColor;
						Game.m_base[blockPos.x][blockPos.y + 1] = blockColor;
						Game.m_base[blockPos.x + 1][blockPos.y + 1] = blockColor;
					} else
						return true;
					break;
				case 1: // 突出在左
					if (blockPos.y < 20)
						Game.m_base[blockPos.x][blockPos.y] = blockColor;
					else
						return true;
					if (blockPos.y + 1 < 20) {
						Game.m_base[blockPos.x - 1][blockPos.y + 1] = blockColor;
						Game.m_base[blockPos.x][blockPos.y + 1] = blockColor;
					} else
						return true;
					if (blockPos.y + 2 < 20)
						Game.m_base[blockPos.x][blockPos.y + 2] = blockColor;
					else
						return true;
					break;
				case 2: // 突出在上
					if (blockPos.y < 20) {
						Game.m_base[blockPos.x][blockPos.y] = blockColor;
						Game.m_base[blockPos.x + 1][blockPos.y] = blockColor;
						Game.m_base[blockPos.x + 2][blockPos.y] = blockColor;
					} else
						return true;
					if (blockPos.y + 1 < 20)
						Game.m_base[blockPos.x + 1][blockPos.y + 1] = blockColor;
					else
						return true;
					break;
				case 3: // 突出在右
					if (blockPos.y < 20)
						Game.m_base[blockPos.x][blockPos.y] = blockColor;
					else
						return true;
					if (blockPos.y + 1 < 20) {
						Game.m_base[blockPos.x + 1][blockPos.y + 1] = blockColor;
						Game.m_base[blockPos.x][blockPos.y + 1] = blockColor;
					} else
						return true;
					if (blockPos.y + 2 < 20)
						Game.m_base[blockPos.x][blockPos.y + 2] = blockColor;
					else
						return true;
				}
				break;
			case 3: // 左折角
				switch (style) {
				case 0: // 突出在上
					if (blockPos.y < 20) {
						Game.m_base[blockPos.x][blockPos.y] = blockColor;
						Game.m_base[blockPos.x + 1][blockPos.y] = blockColor;
						Game.m_base[blockPos.x + 2][blockPos.y] = blockColor;
					} else
						return true;
					if (blockPos.y + 1 < 20)
						Game.m_base[blockPos.x][blockPos.y + 1] = blockColor;
					else
						return true;
					break;
				case 1: // 突出在右
					if (blockPos.y < 20)
						Game.m_base[blockPos.x][blockPos.y] = blockColor;
					else
						return true;
					if (blockPos.y + 1 < 20)
						Game.m_base[blockPos.x][blockPos.y + 1] = blockColor;
					else
						return true;
					if (blockPos.y + 2 < 20) {
						Game.m_base[blockPos.x][blockPos.y + 2] = blockColor;
						Game.m_base[blockPos.x + 1][blockPos.y + 2] = blockColor;
					} else
						return true;
					break;
				case 2: // 突出在下
					if (blockPos.y < 20)
						Game.m_base[blockPos.x][blockPos.y] = blockColor;
					else
						return true;
					if (blockPos.y + 1 < 20) {
						Game.m_base[blockPos.x][blockPos.y + 1] = blockColor;
						Game.m_base[blockPos.x - 2][blockPos.y + 1] = blockColor;
						Game.m_base[blockPos.x - 1][blockPos.y + 1] = blockColor;
					} else
						return true;
					break;
				case 3: // 突出在左
					if (blockPos.y < 20) {
						Game.m_base[blockPos.x][blockPos.y] = blockColor;
						Game.m_base[blockPos.x + 1][blockPos.y] = blockColor;
					} else
						return true;
					if (blockPos.y + 1 < 20)
						Game.m_base[blockPos.x + 1][blockPos.y + 1] = blockColor;
					else
						return true;
					if (blockPos.y + 2 < 20)
						Game.m_base[blockPos.x + 1][blockPos.y + 2] = blockColor;
					else
						return true;
				}
				break;
			case 4: // 右折角
				switch (style) {
				case 0: // 突出在上
					if (blockPos.y < 20) {
						Game.m_base[blockPos.x][blockPos.y] = blockColor;
						Game.m_base[blockPos.x + 1][blockPos.y] = blockColor;
						Game.m_base[blockPos.x + 2][blockPos.y] = blockColor;
					} else
						return true;
					if (blockPos.y + 1 < 20)
						Game.m_base[blockPos.x + 2][blockPos.y + 1] = blockColor;
					else
						return true;
					break;
				case 1: // 突出在右
					if (blockPos.y < 20) {
						Game.m_base[blockPos.x][blockPos.y] = blockColor;
						Game.m_base[blockPos.x + 1][blockPos.y] = blockColor;
					} else
						return true;
					if (blockPos.y + 1 < 20)
						Game.m_base[blockPos.x][blockPos.y + 1] = blockColor;
					else
						return true;
					if (blockPos.y + 2 < 20)
						Game.m_base[blockPos.x][blockPos.y + 2] = blockColor;
					else
						return true;
					break;
				case 2: // 突出在下
					if (blockPos.y < 20)
						Game.m_base[blockPos.x][blockPos.y] = blockColor;
					else
						return true;
					if (blockPos.y + 1 < 20) {
						Game.m_base[blockPos.x][blockPos.y + 1] = blockColor;
						Game.m_base[blockPos.x + 1][blockPos.y + 1] = blockColor;
						Game.m_base[blockPos.x + 2][blockPos.y + 1] = blockColor;
					} else
						return true;
					break;
				case 3: // 突出在左
					if (blockPos.y < 20)
						Game.m_base[blockPos.x][blockPos.y] = blockColor;
					else
						return true;
					if (blockPos.y + 1 < 20)
						Game.m_base[blockPos.x][blockPos.y + 1] = blockColor;
					else
						return true;
					if (blockPos.y + 2 < 20) {
						Game.m_base[blockPos.x][blockPos.y + 2] = blockColor;
						Game.m_base[blockPos.x - 1][blockPos.y + 2] = blockColor;
					} else
						return true;
				}
				break;
			case 5: // z 字
				switch (style) {
				case 0: // 躺着
					if (blockPos.y < 20) {
						Game.m_base[blockPos.x][blockPos.y] = blockColor;
						Game.m_base[blockPos.x + 1][blockPos.y] = blockColor;
					} else
						return true;
					if (blockPos.y + 1 < 20) {
						Game.m_base[blockPos.x - 1][blockPos.y + 1] = blockColor;
						Game.m_base[blockPos.x][blockPos.y + 1] = blockColor;
					} else
						return true;
					break;
				case 1: // 竖着
					if (blockPos.y < 20)
						Game.m_base[blockPos.x][blockPos.y] = blockColor;
					else
						return true;
					if (blockPos.y + 1 < 20) {
						Game.m_base[blockPos.x][blockPos.y + 1] = blockColor;
						Game.m_base[blockPos.x + 1][blockPos.y + 1] = blockColor;
					} else
						return true;
					if (blockPos.y + 2 < 20)
						Game.m_base[blockPos.x + 1][blockPos.y + 2] = blockColor;
					else
						return true;
					break;
				}
				break;
			case 6: // 反 z 字
				switch (style) {
				case 0: // 躺着
					if (blockPos.y < 20) {
						Game.m_base[blockPos.x][blockPos.y] = blockColor;
						Game.m_base[blockPos.x + 1][blockPos.y] = blockColor;
					} else
						return true;
					if (blockPos.y + 1 < 20) {
						Game.m_base[blockPos.x + 1][blockPos.y + 1] = blockColor;
						Game.m_base[blockPos.x + 2][blockPos.y + 1] = blockColor;
					} else
						return true;
					break;
				case 1: // 竖着
					if (blockPos.y < 20)
						Game.m_base[blockPos.x][blockPos.y] = blockColor;
					else
						return true;
					if (blockPos.y + 1 < 20) {
						Game.m_base[blockPos.x - 1][blockPos.y + 1] = blockColor;
						Game.m_base[blockPos.x][blockPos.y + 1] = blockColor;
					} else
						return true;
					if (blockPos.y + 2 < 20)
						Game.m_base[blockPos.x - 1][blockPos.y + 2] = blockColor;
					else
						return true;
					break;
				}
				
				break;
			}
			//Game.m_gameUI.repaint(); // gameUI.repaint();
			// 消去满行
			var queue = new Array();
			var nLines = 0;
			for (var j = 19; j >= 0; j--) { // 行
				var isLineFull = true;
				for (var i = 0; i < 10; i++) // 列
				{
					if (Game.m_base[i][j] == 0) {
						isLineFull = false;
						break;
					}
				}
				if (isLineFull) {
					nLines++; // 计算有多少行要消去
					queue.push(j);
				}
			}
			
			if (nLines > 0) {
				//var ani = true;
				if (Game.ANI) {
					clearTimeout(Game.m_downTimer);
					Game.setEffecting(true); // 进入动画
					var beforeDispear = Game.Display();
					Game.m_gameUI.dispearLinesEffect(queue, beforeDispear, function (queue, nLines) {
						Game.AfterDispear(queue, nLines);
						Game.setEffecting(false); // 不要忘了退出动画
						Game.DownThread();
					});
				} else {
					Game.AfterDispear(queue, nLines);
				}
			}
		}
		return false;
	},
	
	AfterDispear : function (queue, nLines) {
		var queueCount = queue.length;
		for (var iq = 0; iq < queueCount; iq++) {
			// 消行
			var lineIndex = queue[iq];
			for (; lineIndex < 20; ++lineIndex) {
				for (var i = 0; i < 10; i++) {
					Game.m_base[i][lineIndex] = Game.m_base[i][lineIndex + 1];
				}
			}
		}
		
		// 加分
		switch (nLines) {
		case 1:
			Game.m_iScore += (Game.SCORE_PLUS_1 + Game.m_nLevel + Game.m_isAutoUpBase);
			break;
		case 2:
			Game.m_iScore += (Game.SCORE_PLUS_2 + Game.m_nLevel + Game.m_isAutoUpBase);
			break;
		case 3:
			Game.m_iScore += (Game.SCORE_PLUS_3 + Game.m_nLevel + Game.m_isAutoUpBase);
			break;
		case 4:
			Game.m_iScore += (Game.SCORE_PLUS_4 + Game.m_nLevel + Game.m_isAutoUpBase);
			break;
		}
		
		Game.m_iScore = Math.floor(Game.m_iScore);
		if (nLines > 0 && Game.m_nLevel < 9) {
			Game.m_nLevel = Game.m_nInitLevel + (Game.m_iScore / Game.LEVEL_SCORE);
			Game.m_nLevel = Math.floor(Game.m_nLevel);
		}
	},
	
	/**
	 * 游戏是否在运行
	 *
	 * @return true 正在运行，false 没有运行
	 */
	IsRunning : function () { // synchronized
		return Game.m_running;
	},
	
	/**
	 * 获得当前游戏分数
	 *
	 * @return int 分数
	 */
	GetScore : function () {
		return Game.m_iScore;
	},
	
	/**
	 * 获得当前游戏等级
	 *
	 * @return
	 */
	GetLevel : function () {
		return Game.m_nLevel;
	},
	
	/**
	 * 设置游戏开始等级
	 *
	 * @param newLevel
	 *            级别 0-8
	 */
	SetInitLevel : function (newLevel) {
		if (newLevel <= 9)
			Game.m_nInitLevel = newLevel;
	},
	
	/**
	 * 获得下一个方块的图案
	 *
	 * @return 表示下一个方块的字符串
	 */
	GetNext : function () { // synchronized
		//var nextCube = "";
		var next = new Array(4); //int[][]next = new int[4][2];
		for (var i = 0; i < 4; ++i)
			next[i] = new Array(2);
		
		for (var i = 0; i < 4; i++)
			for (var j = 0; j < 2; j++)
				next[i][j] = 0;
		
		if (!Game.m_running) {
			return {
				type : Game.m_nextType,
				array : next
			};
		}
		
		switch (Game.m_nextType) // 判断是哪种方块
		{
		case 0: // 方块
			next[1][1] = 1;
			next[2][1] = 1;
			next[1][0] = 1;
			next[2][0] = 1;
			break;
		case 1: // 长条
			next[0][0] = 1;
			next[1][0] = 1;
			next[2][0] = 1;
			next[3][0] = 1;
			break;
		case 2: // 三角
			next[1][1] = 1;
			next[0][0] = 1;
			next[1][0] = 1;
			next[2][0] = 1;
			break;
		case 3: // 左折角
			next[0][1] = 1;
			next[0][0] = 1;
			next[1][0] = 1;
			next[2][0] = 1;
			break;
		case 4: // 右折角
			next[2][1] = 1;
			next[0][0] = 1;
			next[1][0] = 1;
			next[2][0] = 1;
			break;
		case 5: // z 字
			next[0][1] = 1;
			next[1][1] = 1;
			next[1][0] = 1;
			next[2][0] = 1;
			break;
		case 6: // 反 z 字
			next[1][1] = 1;
			next[2][1] = 1;
			next[0][0] = 1;
			next[1][0] = 1;
			break;
		}
		
		/*for (var j = 1; j >= 0; j--) {
		for (var i = 0; i < 4; i++) {
		if (next[i][j] == 1)
		nextCube += '*';
		else
		nextCube += ' ';
		}
		nextCube += "\n";
		}*/
		
		var nextJson = {
			type : Game.m_nextType,
			array : next
		};
		
		return nextJson;
	},
	
	GetPlayingTime : function () {
		var curTime = Math.floor((new Date()).getTime() / 1000);
		if (Game.m_lastTime <= 0) {
			Game.m_lastTime = curTime;
		} else {
			Game.m_cumulativeTime += (curTime - Game.m_lastTime);
			Game.m_lastTime = curTime;
		}
		return Game.m_cumulativeTime;
	},
	
	/**
	 * 当 UI 接收到"下"的按键命令后，调用此函数
	 */
	KeyDownPressed : function () {
		if (Game.m_effecting)
			return;
		if (Game.BlockVMove(-1)) {
			if (Game.NewCurBlock()) {
				Game.Stop();
			}
		}
		if (!Game.m_effecting)
			Game.m_gameUI.repaint();
	},
	
	/**
	 * 当 UI 接收到"左"的按键命令后，调用此函数
	 */
	KeyLeftPressed : function () {
		if (!Game.BlockHMove(-1)) {
			Game.m_gameUI.repaint();
		}
	},
	
	/**
	 * 当 UI 接收到"右"的按键命令后，调用此函数
	 */
	KeyRightPressed : function () {
		if (!Game.BlockHMove(1)) {
			Game.m_gameUI.repaint();
		}
	},
	
	/**
	 * 当 UI 接收到"下降到底"的按键命令后，调用此函数
	 */
	KeyDownToBasePressed : function () {
		/*var d = new Date();
		var currentTimeMillis = d.getMilliseconds();
		if (Game.m_downToBaseInterval != 0) {
		if (currentTimeMillis - Game.m_downToBaseInterval <= 10) {
		//System.out.println("f");
		return;
		}
		}
		Game.m_downToBaseInterval = currentTimeMillis;*/
		while (!Game.BlockVMove(-1));
		Game.m_gameUI.repaint();
		// gameUI.paint(gameUI.getGraphics());
		
		// effecting = true;
		/*
		 * if (Game.NewCurBlock()) { Stop(); }
		 */
	},
	
	/**
	 * 当 UI 接收到"旋转"的按键命令后，调用此函数
	 */
	KeyRotatePressed : function () {
		if (!Game.BlockRotate()) {
			Game.m_gameUI.repaint();
		}
	},
	
	/**
	 * 游戏是否暂停
	 *
	 * @return true 暂停了，false 没有
	 */
	IsPaused : function () {
		return Game.m_paused;
	},
	
	/**
	 * 暂停/继续游戏
	 */
	Pause : function () { // synchronized
		if (Game.m_running) // 游戏正在运行才能暂停
		{
			Game.m_paused = !Game.m_paused;
			Game.m_lastTime = (new Date()).getTime() / 1000;
			Game.m_lastTime = Math.floor(Game.m_lastTime);
		}
		Game.m_gameUI.repaint();
	},
	
	/**
	 * 开关作弊功能
	 */
	EnableCheat : function () {
		Game.m_cheat = !Game.m_cheat; // 打开作弊
	},
	
	/**
	 * 作弊
	 *
	 * @return 0 成功作弊，1 没有打开作弊
	 */
	Cheat : function () { // synchronized
		if (!Game.m_cheat)
			return 1;
		for (var curLine = 0; curLine < 19; curLine++) // 消去最下一行
		{
			for (var c = 0; c < 10; c++)
				Game.m_base[c][curLine] = Game.m_base[c][curLine + 1];
		}
		return 0;
	},
	
	/**
	 * 是否 Game Over 和 游戏是否运行 不同，这是运行过了的
	 *
	 * @return true/false
	 */
	IsGameOver : function () { // synchronized
		return Game.m_isGameOver;
	},
	
	/**
	 * 停止游戏
	 */
	Stop : function () { // synchronized
		if (Game.m_effecting)
			return;
		// 游戏停止
		Game.m_running = false;
		Game.m_paused = false;
		Game.m_isGameOver = true;
		
		Game.m_lastTime = 0;
		Game.m_cumulativeTime = 0;
		
		Game.m_curBlock = null;
		
		clearTimeout(Game.m_downTimer);
		if (Game.m_upBaseTimer != null)
			clearTimeout(Game.m_upBaseTimer)
			
			// 清空
			for (var i = 0; i < 10; i++) {
				for (var j = 0; j < 23; j++) {
					if (j < 20)
						Game.m_ground[i][j] = 0;
					Game.m_base[i][j] = 0;
				}
			}
		
		//Game.m_gameUI.repaint();
		Game.m_gameUI.stopedGame();
	},
	
	/**
	 * 开始游戏
	 */
	Start : function () { // synchronized
		Game.m_running = true;
		Game.m_paused = false;
		Game.m_isGameOver = false;
		
		Game.m_lastTime = 0;
		Game.m_cumulativeTime = 0;
		
		// 清空
		for (var i = 0; i < 10; i++) {
			for (var j = 0; j < 23; j++) {
				if (j < 20)
					Game.m_ground[i][j] = 0;
				Game.m_base[i][j] = 0;
			}
		}
		Game.NewCurBlock();
		Game.m_iScore = 0;
		Game.m_nLevel = Game.m_nInitLevel;
		
		Game.m_lastTime = (new Date()).getTime() / 1000;
		Game.m_lastTime = Math.floor(Game.m_lastTime);
		
		// TODO: here, not thread, use timer to replace
		//Game.m_downTimer = setTimeout("FileManager.closeMessage()", 10000);
		Game.DownThread();
		/*if (m_isAutoUpBase == 1) {
		upBaseThread = new UpBaseThread(this);
		upBaseThread.start();
		}
		 */
	},
	
	DownThread : function () {
		clearTimeout(Game.m_downTimer);
		if (Game.m_effecting)
			return;
		var interval;
		if (Game.IsRunning() && !Game.IsPaused()) {
			Game.KeyDownPressed();
			
			interval = Game.DEFAULT_DOWN_INTERVAL - Game.GetLevel()
				 * Game.DOWN_INTERVAL_CHANGE;
		} else
			interval = Game.DEFAULT_DOWN_INTERVAL;
		
		Game.m_downTimer = setTimeout(function () {
				Game.DownThread();
			}, interval);
	},
	
	/**
	 * 提升底部
	 *
	 * @return false 完成，true 游戏结束
	 */
	UpBase : function () { // synchronized
		if (Game.m_running && !Game.m_paused) {
			// static int s=0;
			var f = false;
			var b = Game.m_curBlock.GetPos();
			if ((b.x > 0 && Game.m_base[b.x - 1][b.y - 1] > 0)
				 || Game.m_base[b.x][b.y - 1] > 0) {
				return false;
			} else {
				if (b.x < 9 && Game.m_base[b.x + 1][b.y - 1] > 0)
					return false;
			}
			for (var j = 19; j >= 0; j--) // 行
			{
				for (var i = 0; i < 10; i++) // 列
				{
					if (j == 19 && Game.m_base[i][j] > 0)
						f = true;
					if (j < 19)
						m_base[i][j + 1] = Game.m_base[i][j];
					if (j == 0) {
						if ((i + Game.m_s) % 2 == 1) {
							Game.m_base[i][j] = 1;
						} else {
							Game.m_base[i][j] = 0;
						}
					}
				}
				if (f)
					return true;
			}
			Game.m_s++;
			return false;
		}
		return false;
	},
	
	/**
	 * 设置是否自动提升底部以增加难度
	 *
	 * @param isAutoUp
	 */
	SetAutoUp : function (isAutoUp) {
		if (!Game.m_running) {
			Game.m_isAutoUpBase = isAutoUp;
		}
	},
	
	/**
	 * 界面在处理特效 后台线程要等待
	 * @return
	 * @uml.property  name="effecting"
	 */
	isEffecting : function () { // synchronized
		return Game.m_effecting;
	},
	
	/**
	 * 设置运行特效
	 * @param  effecting
	 * @uml.property  name="effecting"
	 */
	setEffecting : function (effecting) { // synchronized
		Game.m_effecting = effecting;
	}
	
};
