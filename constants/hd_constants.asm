; Scene ids stored in wHDScene. The browser's HD layer reads this byte
; (see web/public/hd) to decide which redrawn screen to show; HDSCENE_NONE
; means "show the normal pixel screen".
	const_def
	const HDSCENE_NONE        ; 0
	const HDSCENE_TITLE       ; 1
	const HDSCENE_MAIN_MENU   ; 2
	const HDSCENE_PROF_INTRO  ; 3
	const HDSCENE_NAME_CHOICE ; 4
	const HDSCENE_NAMING      ; 5
	const HDSCENE_SPLASH      ; 6
	const HDSCENE_INTRO       ; 7
	const HDSCENE_OPTIONS     ; 8
