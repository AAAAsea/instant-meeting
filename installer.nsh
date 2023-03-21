
!macro customInstall
  DeleteRegKey HKCR "insm"
  WriteRegStr HKCR "insm" "" "URL:insm"
  WriteRegStr HKCR "insm" "URL Protocol" ""
  WriteRegStr HKCR "insm\shell" "" ""
  WriteRegStr HKCR "insm\shell\Open" "" ""
  WriteRegStr HKCR "insm\shell\Open\command" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME} %1"
!macroend

!macro customUnInstall
  DeleteRegKey HKCR "insm"
!macroend