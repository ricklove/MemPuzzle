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

### 4:39-4:49

- Test Performance
	- iPhone4 = OK
	- iPhone3S = 
	- Kindle Fire (2012 - Original 2nd Gen) =
	- Kindle HD (2012) = Good
		- BUG: Highlights Canvas while dragging
		- Snap is too small


### 4:50-5:08

- Adjust snap length to piece size


### 5:09-5:14

- Constrain Piece Location to inside screen

### 5:15-5:29

- Adjust puzzle padding to make room for pieces

### 5:30-5:32

- Adjust outline thickness

### 5:33-5:37

- Adjust stack location

### 5:38-5:50

- Publish
- Test


## Period 4

### 3:37-3:39 Plan

- Test as App
- Add Logging & Analytics

### 3:40-3:59

- Add logging System

### 4:00-4:03

- Create PhoneGapBuild project
	- Add config.xml

### 4:04-4:14

- Add more logging

### 4:15-4:20

- Create Google Analytics Account
- Add tracking id to app

### 4:21-4:47

- Test google analytics 
	- localhost: OK
	- website: OK - but logging is broken

- Update logging
- Manually change file length from TOLD to Told rename to cause website to update

### 4:48-5:15
### 5:20-5:47

- Improved Logging
- Publish
- Update PhoneGap
	- Build with app key

- Test on Kindle Fire Browser
	- Stuck at creating pieces
	- Improve Logging for Create Pieces
	- Deploy to website 
	- Retest
	- Add Error Logging
	- Deploy to website 
	- Retest (Still no pieces and no error - fabric.Image.loadUrl (dataURL...) is failing

- Test on iPhone Browser
	- !First piece is blank (Font not loaded)

### 5:48-5:58
### 6:30-6:40

- Test on Kindle Fire HD
	- Download apk
	- Google Analytics: OK
	- Font: OK
	- Performance: Poor when dragging
	- BUG: Highlighting canvas

### 6:41-6:44

- Disable Highlight on Kindle

### 6:45-7:04

- Removed permissions in config.xml
- Use PhoneGap Fast Canvas plugin
- Add no scale meta tag


- Publish
- Test on Kindle HD Browser
	- Performance: Good
	- FIX: Not highlighting now

- Test on iPhone 4 Browser
	- BUG: Scaling is using small default resolution
	- Performance: Great (Maybe due to using small resolution)

- Test on Kingle HD PhoneGap
	- PhoneGap FastCanvas plugin - unsupported!

### 7:05-7:41

- Adjust scale for iPhone4
- Publish
- Test
	- Still not right

- Add Logging to createPuzzleCompleted for Kindle Testing
- Add Logging to track screen size

- Publish
- Test iPhone4 
	- BUG: canvas is using strict resolution and ignoring device dpi

- Multiply canvas size by device pixel ratio

- Publish
- Test iPhone4 
	- BUG: Now canvas is off screen

- Test Kindle createPuzzleCompleted
	- BUG: No imageData being saved in createPuzzleFromText


### 8:30-8:41

- Remove bad scaling
- Fix Google Analytics auto tracking page view before app settings loaded
- Show loading screen for set time


## Period 5

### 2014-08-06 4:00-5:11

- Load and Test CocoonJS app
	- From: http://support.ludei.com/hc/en-us/articles/200767258-Creating-an-installable-Android-APK
	- Download debug.apk and unsigned.apk (for release)


- Created SOP for signing apk file
	- At ~\Dropbox\Programming\SOP_StandardOperatingProcedures\SigningAndroidApkFileForPublishing.md


### 5:12-5:28

- Copy debug.apk to kindle and test
- Test
	- Not working:
		- Loading screen displayed
		- App exits after a few seconds
	- Google Analytics: CocoonJS converts spaces to %20
	- Loading of scripts - OK
	- MemPuzzle constructor called
	- LAST EVENT: MemPuzzle_Construct -> 01 - BEGIN
	- Possible Problems:
		- Changing the size of the main canvas:
			- With Canvas+ the screen is scalled to the main canvas, it may not be allowed to change it's size after creation
		- Creating a fabric.Canvas:
			- fabricJS may do something incompatible with CocoonJS
	- To Resolve:
		- Add more logging to detect exact time of failure

### 5:29-5:32

- Create a CocoonJS launcher (from project on CocoonJS website)

### 6:30-6:45

- Test on iPhone4 CocoonJS launcher
	- Performance: OK
	- BUG: Transparency of pieces was broken, so they had a black background

- Custom CocoonJS launcher is not needed
- Install Generic CocoonJS launcher on Kindle Fire HD
	- Forget this... Just download the custom launcher

### 6:45-7:10

- Tweak Told Loading Logo Animation



## Period 6

### 15:30-15:40

A refactor is required to solve performance issues:

- REFACTOR:
	- Move CreateImageSource and CreatePiece to own files
	- Remove fabricjs from everything but the last canvas (and possibly image creation canvas)
		- Remove toDataUrl and use DrawImage directly with multiple canvases
	- Provide only one moving piece
		- Create puzzle static canvas for everything but moving pieces
		- Create fabricjs canvas with only static canvas image and one moving piece
		- Find bounding box and clip snapshot
		- Turn off pixel perfect dragging
		- Allow click to place (if in correct location)

### 2014-08-12 4:01-4:03

- Review Notes
- Begin REFACTOR

### 4:04-5:22

- Create ImageSource file
- Move CreatePuzzleFromText to ImageSource
- Show Completed Puzzle image from canvas

### 5:23-5:36

- Prepare to refactor CreatePuzzlePieces

### 6:30-7:20

- BEGIN Create Puzzle Images

### 7:21-7:48

- BEGIN Implement Puzzle Images


## Period 7

### 3:33-4:59

- CONTINUE: Implement Puzzle Images
	- Rewrite Create Edges

### 5:00-5:03

- CONTINUE: Implement Puzzle Images
	- Finish Create Pieces

### 5:04-6:05

- Implement Draw Pieces
	- Draw Whole
	- Draw Pieces

### 6:05-6:10

- Round piece edges to pixels


## Period 8

### 3:25-4:03

- Use real edges as clip
- Calculate actual bounds

### 4:04-4:32

- Create pieces from PieceImages

### 4:33-4:52

- Fix snap and puzzle complete logic

### 4:53-5:07

- Fix next puzzle

### 5:08-5:16

- Fix stack pieces

### 5:17-5:44

- Only show a single piece at a time

### 5:45-5:47

- Hide working canvases

### 5:48-5:51

- Reduce radius size

### 5:52-5:53

- Publish & Test on Website

### 6:50-6:51

- Disable Zoom

---

# TODO

- Handle screen size change

- Provide sense of progress and accomplishment

- BUG: Font is not being loaded on first puzzle sometimes


# TODO Maybe

- Allow click to place (if in correct location)
- Create puzzle static canvas for everything but moving pieces
