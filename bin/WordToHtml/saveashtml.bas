Attribute VB_Name = "NewMacros"
Sub saveashtml()
Attribute saveashtml.VB_ProcData.VB_Invoke_Func = "Normal.NewMacros.saveashtml"
'
' saveashtml Macro
'
'
Dim xmlname As String
xmlname = ActiveDocument.FullName
xmlname = Replace(xmlname, ".docx", ".html", , , vbTextCompare)
xmlname = Replace(xmlname, ".doc", ".html", , , vbTextCompare)
ActiveDocument.SaveAs FileName:=xmlname, FileFormat:=wdFormatHTML, LockComments:=False, Password:="", AddToRecentFiles:=True, WritePassword:="", ReadOnlyRecommended:=False, EmbedTrueTypeFonts:=False, SaveNativePictureFormat:=False, SaveFormsData:=False, SaveAsAOCELetter:=False
Application.Quit
End Sub
