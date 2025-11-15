import json
from src.dataset import load_data, to_json_string, to_toon, from_toon


def test_load_data(tmp_path):
    # create temporary json file
    data = [{'a': 1}, {'b': 2}]
    p = tmp_path / 'data.json'
    p.write_text(json.dumps(data))
    loaded = load_data(p)
    assert loaded == data


def test_json_and_toon_roundtrip():
    data = {'x': 1, 'y': [1, 2, 3]}
    json_str = to_json_string(data)
    # ensure valid JSON
    parsed = json.loads(json_str)
    assert parsed == data
    # test TOON encoding/decoding if available
    try:
        toon_str = to_toon(data)
        recovered = from_toon(toon_str)
        assert recovered == data
    except RuntimeError:
        # toon-format not installed; skip
        pass