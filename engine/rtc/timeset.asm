SyncDeviceTime:
; Set the game clock from DeviceTime (day of week, hours, minutes, seconds), which the browser fills in.
	ld hl, DeviceTime
	ld de, wStringBuffer2
	ld bc, 4
	call CopyBytes
	jp InitTime

PrintTwoDigitNumberLeftAlign:
	push hl
	ld a, ' '
	ld [hli], a
	ld [hl], a
	pop hl
	lb bc, PRINTNUM_LEFTALIGN | 1, 2
	call PrintNum
	ret

MrChrono:
	hlcoord 1, 14
	lb bc, 3, SCREEN_WIDTH - 2
	call ClearBox
	ld hl, .Text
	call PrintTextboxTextAt
	ret

.Text:
	text_asm
	call UpdateTime

	hlcoord 1, 14
	ld [hl], 'R'
	inc hl
	ld [hl], 'T'
	inc hl
	ld [hl], ' '
	inc hl

	ld de, hRTCDayLo
	call .PrintTime

	hlcoord 1, 16
	ld [hl], 'D'
	inc hl
	ld [hl], 'F'
	inc hl
	ld [hl], ' '
	inc hl

	ld de, wStartDay
	call .PrintTime

	ld [hl], ' '
	inc hl

	ld a, [wDST]
	bit DST_F, a
	jr z, .off

	ld [hl], 'O'
	inc hl
	ld [hl], 'N'
	inc hl
	jr .done

.off
	ld [hl], 'O'
	inc hl
	ld [hl], 'F'
	inc hl
	ld [hl], 'F'
	inc hl

.done
	ld hl, .NowOnDebug
	ret

.NowOnDebug:
	text_start
	para "Now on DEBUG…"
	prompt

.PrintTime:
	lb bc, 1, 3
	call PrintNum
	ld [hl], '.'
	inc hl
	inc de
	lb bc, PRINTNUM_LEADINGZEROS | 1, 2
	call PrintNum
	ld [hl], ':'
	inc hl
	inc de
	lb bc, PRINTNUM_LEADINGZEROS | 1, 2
	call PrintNum
	ret

PrintHour:
	ld l, e
	ld h, d
	push bc
	call GetTimeOfDayString
	call PlaceString
	ld l, c
	ld h, b
	inc hl
	pop bc
	call AdjustHourForAMorPM
	ld [wTextDecimalByte], a
	ld de, wTextDecimalByte
	call PrintTwoDigitNumberLeftAlign
	ret

GetTimeOfDayString:
	ld a, c
	cp MORN_HOUR
	jr c, .nite
	cp DAY_HOUR
	jr c, .morn
	cp NITE_HOUR
	jr c, .day
.nite
	ld de, .nite_string
	ret
.morn
	ld de, .morn_string
	ret
.day
	ld de, .day_string
	ret

.nite_string: db "NITE@"
.morn_string: db "MORN@"
.day_string:  db "DAY@"

AdjustHourForAMorPM:
; Convert the hour stored in c (0-23) to a 1-12 value
	ld a, c
	or a
	jr z, .midnight
	cp NOON_HOUR
	ret c
	ret z
	sub NOON_HOUR
	ret

.midnight
	ld a, NOON_HOUR
	ret
