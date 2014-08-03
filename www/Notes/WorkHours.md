~~~
// Actual Work Time Periods and Immediate Tasks
~~~

# Prototype

## 5 Hours

### 2014-07-31

### Create Prototype

# Version 1

## Period 1

### 2014-08-01 3:35-3:59 Plan

What is the most beneficial product to create in the next 10 hours?

- A MemPuzzle for Sight Words published on Google Play store

What benefits will the product produce?

- Well defined content scope to ensure clear development goals
- Familiarity with sight words
- Confidence with spelling of many difficult words
- Fun mechanics

What are the minimum features required to produce these benefits?

- Load Sight Word List
- Display a Sight Word as a Puzzle
- Create puzzle piece shape (instead of straight edges)
- Respond to completion of puzzle
- Display Score for Puzzle
	- 3 Stars (2 Seconds / Piece)
	- 2 Stars (4 Seconds / Piece)
	- 1 Star (Completion)
- Display World List
	- 5 Worlds - 9 Pieces (Divide Sight Words among worlds)
	- 5 Worlds - 16 Pieces
	- 5 Worlds - 25 Pieces

Tasks

- Create Notes


### 4:00-5:40

- Display a Word as a Puzzle

### 6:15-7:36

- Create puzzle shape
	- Create simple shape calculation
	- Divide rect into line parts
	- Create curvy side

### 10:01-10:55

- Store edges

### 11:00-11:05

- Randomly switch from concave to convex edge

### 11:05-11:21

- Create underlap of 2 pixel on edges
- Change colors
- Create Padding

### 11:25-11:50

- Create outside flat edge
- Sans Serif Font

### 11:50-11:58

- Fix big puzzle piece (not using h/v properly)

### 11:59-12:06
### 12:35-12:45

- BEGIN: Stacking Pieces
- Randomize z-index of pieces

### 15:53-15:59
### 16:01-16:39

- Stack pieces in corner
	- Create IPiece
	- Stack Pieces on puzzle create

### 16:40-16:57

- Draw Outline

### 17:00-17:29

- BEGIN: Spread Out Pieces

## Period 2

### 2014-08-02 3:34-3:36 Plan

Finished Features

* Display a Word as a Puzzle
* Create puzzle piece shape (instead of straight edges)

Remaining Features

- Load Sight Word List
- Respond to completion of puzzle
- Display Score for Puzzle
	- 3 Stars (2 Seconds / Piece)
	- 2 Stars (4 Seconds / Piece)
	- 1 Star (Completion)
- Display World List
	- 5 Worlds - 9 Pieces (Divide Sight Words among worlds)
	- 5 Worlds - 16 Pieces
	- 5 Worlds - 25 Pieces

### 3:37-4:05

- Create Subject Controller

### 4:06-4:18

- Load Sight Words List

### 4:19-4:33

- Respond to Complete Puzzle
- Goto next word on completion

### 4:34-4:46

- Show target picture at beginning of puzzle

### 4:47-4:57

- Reduce number of pieces for simple words
- Change to monospace

### 4:58-5:45

- Use a custom handwriting font

### 5:45-5:54
### 5:54-6:52

- Wait for custom font to load

### 7:24-7:35

- Bring clicked puzzle piece to front
- Resume index

### 8:36-9:35

- Publish to website
- Show loading graphic

### 9:36-10:07

- Fix Loading

## Period 3

### 2014-08-03 3:25-3:29 Plan

Organize Task list

### 3:30-3:35

- Use fill rectangle for background

### 3:36-4:01

- Make rectangular pieces have same circle size on each edge

### 4:02-4:17

- Cache puzzle pieces as images (to prevent recalculating clip path each render)
	- Setup code structure

### 4:18-4:27

- Create snapshot of puzzle size (with scaling)

### 4:28-4:38

- Use snapshots

---

# TODO

- Cache puzzle pieces as images (to prevent recalculating clip path each render)
	* Create snapshot of puzzle size (with scaling)
	* Use snapshot
	- Find bounding box and clip snapshot
	- Turn off pixel perfect dragging

- Make snap length, borders, outline, etc. based on ratios of screen size


# TODO Maybe

- Find the visible pixels in the text and resize image for that

- Spread Out Pieces
