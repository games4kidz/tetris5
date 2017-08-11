/* Block.js

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

var Pos = function () {
	this.x = 0;
	this.y = 0;
};

var Block = function (type, initPos) {
	
	// constructor
	this.blockType = type;
	this.pos = new Pos();
	this.pos.x = initPos.x;
	this.pos.y = initPos.y;
	this.style = 0;
	/*public Block(int type) {
	blockType = type;
	pos.x = 0;
	pos.y = 0;
	style = 0;
	}
	
	public Block(int type, Pos initPos) {
	blockType = type;
	pos = initPos;
	style = 0;
	}
	
	public Block() {}*/
	
	this.Down = function () {
		this.pos.y--; //pos.y--;
		return this.pos; //return pos;
	};
	
	this.MoveX = function (x) {
		this.pos.x += x; //pos.x += x;
		/*if (pos.x < 0)
		System.out.println();*/
		return this.pos; //return pos;
	};
	
	this.GetType = function () {
		return this.blockType; //return blockType;
	};
	
	this.GetStyle = function () {
		return this.style; //return style;
	};
	
	this.Rotate = function () {
		switch (this.blockType) {
		case 0:
			break;
		case 1:
			if (this.style == 0)
				this.style++;
			else
				this.style--;
			break;
		case 2:
		case 3:
		case 4:
			if (this.style == 3)
				this.style = 0;
			else
				this.style++;
			break;
		case 5:
		case 6:
			if (this.style == 0)
				this.style++;
			else
				this.style--;
			break;
		}
		return this.style;
	};
	
	this.GetPos = function () {
		return this.pos;
	};
	
	this.SetPos = function (newPos) {
		this.pos = newPos;
	};
	
	/**
	 * @return
	 * @uml.property  name="color"
	 */
	this.getColor = function () {
		return this.color;
	};
	
	/**
	 * @param color
	 * @uml.property  name="color"
	 */
	this.setColor = function (newColor) {
		this.color = newColor;
	};
};
