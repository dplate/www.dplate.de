import outetts
from outetts import GenerationType

# Initialize the interface
interface = outetts.Interface(
    config=outetts.ModelConfig.auto_config(
        model=outetts.Models.VERSION_1_0_SIZE_1B,
        # For llama.cpp backend
        backend=outetts.Backend.LLAMACPP,
        quantization=outetts.LlamaCppQuantization.FP16
        # For transformers backend
        # backend=outetts.Backend.HF,
    )
)

# Or create your own speaker profiles in seconds and reuse them instantly
#speaker = interface.create_speaker(audio_path = 'voice-slow.wav')
#interface.save_speaker(speaker, "speaker.json")
speaker = interface.load_speaker("speaker.json")

# Generate speech
output = interface.generate(
  config=outetts.GenerationConfig(
    text="Nachdem ich mein Auto an der Kirche abgestellt hatte, musste ich leider erst mal zur Ebniter Ach absteigen, da ich nicht den direkten Aufstieg zur Hohen Kugel vorhatte (der wäre dann doch zu kurz gewesen).",
    speaker=speaker,
    generation_type=GenerationType.REGULAR
  )
)

# Save to file
output.save("output.wav")