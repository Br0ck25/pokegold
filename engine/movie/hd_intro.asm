; The start-up screens (studio splash, opening cinematic) are drawn by the
; browser's HD layer (web/public/hd/scenes). The ROM only picks the scene via
; wHDScene, keeps the music going and waits, so a button press can skip it.

DEF SPLASH_FRAMES EQU 330
DEF INTRO_FRAMES  EQU 1500

HDShowScene:
; a = HDSCENE_*, bc = frames to wait.
; Return carry if the player pressed a button to skip.
	ld [wHDScene], a
.loop
	push bc
	call JoyTextDelay
	pop bc
	ldh a, [hJoyLast]
	and PAD_BUTTONS
	jr nz, .skipped
	push bc
	call DelayFrame
	pop bc
	dec bc
	ld a, b
	or c
	jr nz, .loop
	and a
	ret

.skipped
	scf
	ret

SplashScreen:
; Return carry if the player cancelled.
	call ClearBGPalettes
	call ClearTilemap
	xor a
	ldh [hJoyDown], a
	ldh [hSCX], a
	ldh [hSCY], a
	call WaitBGMap
	ld de, MUSIC_NONE
	call PlayMusic
	ld a, HDSCENE_SPLASH
	ld bc, SPLASH_FRAMES
	jp HDShowScene

GoldSilverIntro:
	ld de, MUSIC_GS_OPENING
	call PlayMusic
	ld a, HDSCENE_INTRO
	ld bc, INTRO_FRAMES
	call HDShowScene
	ld de, MUSIC_NONE
	jp PlayMusic
