import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()
url = os.environ.get('DATABASE_URL').replace('postgresql://', 'postgresql+pg8000://')

# Test Transaction mode (port 6543)
print('Testing URL:', url[:40] + '...')
try:
    engine = create_engine(url)
    with engine.connect() as conn:
        print('Connected successfully on 6543!')
        res = conn.execute(text('SELECT 1'))
        print('Result:', res.fetchone())
except Exception as e:
    print('Failed on 6543:', e)

# Test Session mode (port 5432)
url_session = url.replace(':6543/', ':5432/')
print('Testing URL Session Mode:', url_session[:40] + '...')
try:
    engine_session = create_engine(url_session)
    with engine_session.connect() as conn:
        print('Connected successfully on 5432!')
        res = conn.execute(text('SELECT 1'))
        print('Result:', res.fetchone())
except Exception as e:
    print('Failed on 5432:', e)
