' Script khoi dong ngam khong hien cua so den danh cho Xe Dap Duc Huy
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strPath = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = strPath

' 1. Kich hoat may chu Node.js chay ngam (0 = an hoan toan cua so cmd)
WshShell.Run "cmd /c npm run dev", 0, False

' 2. Cho 2.5 giay de may chu tren cong 3000 san sang
WScript.Sleep 2500

' 3. Mo giao dien duoi dang Cua So App Doc Lap (khong co thanh trinh duyet)
WshShell.Run "cmd /c start chrome --app=http://localhost:3000 || start msedge --app=http://localhost:3000 || start http://localhost:3000", 0, False
