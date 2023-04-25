from tiktoken import Tokenizer
from tiktoken.tokenizer import TokenizerConfig
from typing import List

def count_tokens(text: str) -> int:
    tokenizer = Tokenizer()
    try:
        tokens = list(tokenizer.tokenize(text))
        return len(tokens)
    except TokenizerException as e:
        print(f"Error: {e}")
        return 0

text = sys.argv[1]
token_count = count_tokens(text)
print(f"Количество токенов: {token_count}")