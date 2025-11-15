from src.token_counter import compare_formats, normalise_usage


def test_compare_formats_basic():
    data = {'numbers': list(range(10))}
    result = compare_formats(data)
    assert 'json_tokens' in result and 'toon_tokens' in result
    assert result['json_tokens'] >= result['toon_tokens'] or result['savings'] == 0.0


def test_normalise_usage():
    # half of context
    assert normalise_usage(50, 100) == 0.5
    # cap at 1.0
    assert normalise_usage(200, 100) == 1.0