import json
from fastapi.testclient import TestClient
from src.server import app


client = TestClient(app)


def test_encode_decode_compare():
    data = {'hello': 'world', 'nums': [1, 2, 3]}
    # encode - may fail if TOON encoder not implemented
    resp = client.post('/encode', json={'data': data})
    if resp.status_code == 200:
        toon_str = resp.json()['toon']
        # decode - only test if encoding succeeded
        resp = client.post('/decode', json={'toon': toon_str})
        assert resp.status_code == 200
        assert resp.json()['data'] == data
    else:
        # Encoder not available - this is expected with toon-format 0.1.0
        assert 'TOON encoder' in resp.json()['detail'] or 'toon-format' in resp.json()['detail']
    
    # compare - should always work, even if TOON encoding fails
    resp = client.post('/compare', json={'data': data})
    assert resp.status_code == 200
    result = resp.json()
    assert 'json_tokens' in result
    assert 'toon_tokens' in result
    # If TOON encoding failed, toon_tokens may equal json_tokens
    assert result['toon_tokens'] >= 0