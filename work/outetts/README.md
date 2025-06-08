
Installation of llama-ccp with Vulkan GPU support
```
$env:CMAKE_ARGS="-DGGML_VULKAN=on"
pip install llama-cpp-python --upgrade --force-reinstall --no-cache-dir
```

Install latest whisper from github (because version in repository is not yet compatible)
```
pip install git+https://github.com/openai/whisper.git
```

Maybe need to get back to numpy 2.2
```
pip install --force-reinstall --no-cache-dir numpy==2.2
```

Install outetts
```
pip install outetts --upgrade
```

To train a voice, ffmpeg needs to be installed

Run
```
python test.py
```

