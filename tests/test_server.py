import json
from fastapi.testclient import TestClient
from src.server import app


client = TestClient(app)


def test_encode_decode_compare():
    data = {'hello': 'world', 'nums': [1, 2, 3]}
    # encode
    resp = client.post('/encode', json={'data': data})
    assert resp.status_code == 200
    toon_str = resp.json()['toon']
    # decode
    resp = client.post('/decode', json={'toon': toon_str})
    assert resp.status_code == 200
    assert resp.json()['data'] == data
    # compare
    resp = client.post('/compare', json={'data': data})
    assert resp.status_code == 200
    result = resp.json()
    assert 'json_tokens' in result
    assert 'toon_tokens' in result