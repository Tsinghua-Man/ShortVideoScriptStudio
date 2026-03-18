@echo off
setlocal
cd /d "%~dp0"

set "choice=%~1"
set "brief_path_arg=%~2"
set "interactive_mode=1"

echo =============================
echo Short Video Script Agent
echo Current Dir: %cd%
echo =============================
echo.
if not defined choice (
  echo Select mode:
  echo 1. Generate script with sample brief
  echo 2. Generate script with your JSON brief
  echo 3. Generate prompt packet
  echo.
  set /p choice=Enter 1 / 2 / 3 and press Enter: 
)
if defined choice if not "%~1"=="" (
  set "interactive_mode=0"
)

if "%choice%"=="1" goto sample_draft
if "%choice%"=="2" goto custom_draft
if "%choice%"=="3" goto prompt_mode

echo.
echo Invalid input. Please run start_agent.bat again.
goto end

:sample_draft
echo.
echo Generating script with sample brief...
python src\short_video_agent.py --brief examples\sample_brief.json --mode draft --output output_draft.md
if errorlevel 1 goto failed
echo.
echo Done. Output file: output_draft.md
goto end

:custom_draft
echo.
if defined brief_path_arg (
  set "brief_path=%brief_path_arg%"
) else (
  set /p brief_path=Enter your JSON brief path: 
)
if "%brief_path%"=="" (
  echo No file path entered. Please run again.
  goto end
)
echo.
echo Generating script...
python src\short_video_agent.py --brief "%brief_path%" --mode draft --output output_draft.md
if errorlevel 1 goto failed
echo.
echo Done. Output file: output_draft.md
goto end

:prompt_mode
echo.
if defined brief_path_arg (
  set "prompt_brief_path=%brief_path_arg%"
) else (
  set /p prompt_brief_path=Enter your JSON brief path (press Enter to use sample): 
)
if "%prompt_brief_path%"=="" set "prompt_brief_path=examples\sample_brief.json"
echo.
echo Generating prompt packet...
python src\short_video_agent.py --brief "%prompt_brief_path%" --mode prompt --output output_prompt.md
if errorlevel 1 goto failed
echo.
echo Done. Output file: output_prompt.md
goto end

:failed
echo.
echo Run failed. Please check:
echo 1. Python is installed
echo 2. JSON brief path is correct
echo 3. JSON format is valid

:end
echo.
if "%interactive_mode%"=="1" pause
endlocal
