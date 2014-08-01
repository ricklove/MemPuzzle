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

# TODO

- Cache puzzle pieces as images (to prevent recalculating clip path each render)