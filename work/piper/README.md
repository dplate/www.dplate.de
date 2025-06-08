Installation
```
pip install --no-deps -r requirements.txt
pip install onnxruntime
```

Start
```
echo 'Nachdem ich mein Auto an der Kirche abgestellt hatte, musste ich leider erst mal zur Ebniter Ach absteigen, da ich nicht den direkten Aufstieg zur Hohen Kugel vorhatte (der wäre dann doch zu kurz gewesen).' | piper --model de_DE-thorsten-high --sentence-silence 0.2 --length-scale 1.2 --output_file output.wav
```