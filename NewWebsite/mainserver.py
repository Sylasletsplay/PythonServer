import base64
import socket
import threading
import json
import os
import ssl
import bcrypt
import hmac
import hashlib
import datetime
import shop_logic

# --- CONFIGURATION ---
SERVER_HOST = '0.0.0.0'
SERVER_PORT = 443  # Using 443 for HTTPS and WSS

# Locate the certificate files relative to this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CERT_FILE = os.path.join(BASE_DIR, 'server.cert')
KEY_FILE = os.path.join(BASE_DIR, 'server.key')

# --- SETUP SSL CONTEXT ---
try:
    SSL_CONTEXT = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    SSL_CONTEXT.load_cert_chain(certfile=CERT_FILE, keyfile=KEY_FILE)
    print(f"SSL Context loaded. Cert: {CERT_FILE}")
except FileNotFoundError:
    print(f"FATAL ERROR: Could not find {CERT_FILE} or {KEY_FILE}")
    exit()


SERVERKEY = b'Umbreon4daw1n'

# --- HELPER FUNCTIONS ---

def read_file(file_path):
    try:
        with open(file_path, 'r') as file:
            return json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def write_file(file_path):
    try:
        with open(file_path, 'w') as file:
            return json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def write_sort_file(file_path, attribute, sort_key):
    sorted_by_attribute = sorted(attribute, key=lambda x: x[sort_key], reverse=True)
    with open(file_path, 'w') as file:
        json.dump(sorted_by_attribute, file, indent=4)

def save_score(scores, username, score, time):
    new_entry = {
        "username": username,
        "score": int(score),
        "time": time
    }
    scores.append(new_entry)

def create_signed_id(user_id):
    msg = str(user_id).encode('utf-8')
    signature = hmac.new(SERVERKEY, msg, hashlib.sha256).hexdigest()
    return f"{user_id}:{signature}"

def verify_signed_id(signed_token):
    try:
        user_id, received_sig = signed_token.split(':')

        msg = user_id.encode('utf-8')
        expected_sig = hmac.new(SERVERKEY, msg, hashlib.sha256).hexdigest()

        if hmac.compare_digest(received_sig, expected_sig):
            return user_id
        else:
            return None

    except ValueError:
        return None

def hash_password(plain_password):
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed_bytes.decode('utf-8')
def check_password(plain_password, stored_hash):
    password_bytes = plain_password.encode('utf-8')
    stored_hash_bytes = stored_hash.encode('utf-8')
    return bcrypt.checkpw(password_bytes, stored_hash_bytes)

def create_id(username):
    id = username+datetime.datetime.now().strftime('%f')
    return id

def update_users(username, password_input, objective):
    user_file_path = os.path.join(BASE_DIR, 'data', 'users.json')
    users = read_file(user_file_path)

    user_found = False
    credentialCheck = [False, False]

    for entry in users:
        if entry['username'] == username:
            user_found = True
            stored_hash = entry.get('password_hash')
            if check_password(password_input, stored_hash):
                credentialCheck = [True, True]
            else:
                credentialCheck = [True, False]
            break
    if not user_found and objective == 'create':
        secure_hash = hash_password(password_input)
        new_entry = {
            "username": username,
            "password_hash": secure_hash,
            "unique_id": create_id(username),
            "playtime": 0
        }
        users.append(new_entry)
        with open(user_file_path, 'w') as file:
            json.dump(users, file, indent=4)
        credentialCheck = [False, False]

    return credentialCheck

def get_cookie_value(request_data, cookie_name):
    if isinstance(request_data, str):
        lines = request_data.split('\r\n')
    else:
        lines = request_data
    for line in lines:
        if line.startswith("Cookie:"):
            parts = line[7:].split(';')
            for part in parts:
                if '=' in part:
                    key, value = part.split('=')
                    if key.strip() == cookie_name:
                        return value.strip()
    return None


def statistic_saving(path,client_address,user_id,user_action,playtime):
    stats = read_file(path)
    timestamp = datetime.datetime.now().timestamp()

    new_entry = {
        "user_id": user_id,
        "client_address": client_address,
        "timestamp": timestamp,
        "user_action": user_action,
        "playtime": playtime
    }
    stats.append(new_entry)
    with open(path, 'w') as file:
        json.dump(stats, file, indent=4)

def get_element_from_path(element, element_descriptor, search, file_path):
    file = read_file(file_path)
    for entry in file:
        if entry[element_descriptor] == element:
            return entry[search]
    return None

def set_element_from_path(element, element_descriptor, search, file_path, set_value):
    file = read_file(file_path)
    for entry in file:
        if entry[element_descriptor] == element:
            entry[search] = set_value
    with (open(file_path,'w')) as f:
        json.dump(file, f, indent=4)

def get_count_from_json(path,element_descriptor):
    file = read_file(path)
    diff_list = []
    in_list = []
    for entry in file:
        if entry[element_descriptor] not in in_list:
            diff_list.append([entry[element_descriptor],1])
            in_list.append(entry[element_descriptor])
        elif entry[element_descriptor] in in_list:
            diff_list[in_list.index(entry[element_descriptor])][1] += 1
    return diff_list

def get_log_span():
    for elements in os.walk(os.path.join(BASE_DIR, 'stat_logs')):
        return elements[2][0], elements[2][-1]
    return None

def get_date_from_timestamp(timestamp_list):
    for timestamp in timestamp_list:
        date = datetime.datetime.fromtimestamp(timestamp[0])
        print(date)

def perform_handshake(client_socket, request):
    # Extract the WebSocket Key
    headers = request.split("\r\n")
    key = ""
    for line in headers:
        if "Sec-WebSocket-Key:" in line:
            key = line.split(":")[1].strip()

    if not key:
        return False
    # Magic String defined by RFC 6455
    magic_string = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
    # Create the Accept Key
    accept_key = base64.b64encode(
        hashlib.sha1((key + magic_string).encode()).digest()
    ).decode()
    # Send the HTTP 101 Switching Protocols response
    response = (
        "HTTP/1.1 101 Switching Protocols\r\n"
        "Upgrade: websocket\r\n"
        "Connection: Upgrade\r\n"
        f"Sec-WebSocket-Accept: {accept_key}\r\n\r\n"
    )
    client_socket.send(response.encode())
    return True

def decode_frame(frame):
    # assuming it's masked, hence removing the mask bit(MSB) to get len. also assuming len is <125
    payload_len = frame[1] - 128

    mask = frame[2:6]
    encrypted_payload = frame[6: 6 + payload_len]

    payload = bytearray([encrypted_payload[i] ^ mask[i % 4] for i in range(payload_len)])

    return payload

# --- CLIENT HANDLER ---

def websocket_loop(sock):
    while True:
        data = decode_frame(sock.recv(4096))
        if not data: break
        print(f"Received WS Message: {data}")
        send_frame(sock,json.dumps({"status": "success", "message": "Score submitted!"}).encode())

def send_frame(self, payload):
    frame = [129]
    frame += [len(payload)]
    frame_to_send = bytearray(frame) + payload

    self.sendall(frame_to_send)

def handle_client(secure_socket,client_address):
    user_file_path = os.path.join(BASE_DIR, 'data', 'users.json')
    scores_file_path = os.path.join(BASE_DIR, 'data', 'scores.json')
    stat_file_path = os.path.join(BASE_DIR, 'stat_logs', datetime.datetime.today().strftime('%Y_%m_%d')+'.json')
    time_data = "0"
    action = '-'
    user_id = 'Gast'
    auth_token = None
    try:
        # 1. Receive Request (Decrypted automatically)
        request_bytes = secure_socket.recv(4096)
        if not request_bytes:
            secure_socket.close()
            return
        # WS part
        request_data = request_bytes.decode('utf-8', errors='ignore')
        if "Upgrade: websocket" in request_data:
            # Perform the handshake
            success = perform_handshake(secure_socket, request_data)
            if success:
                # 3. Enter WebSocket Loop (New Logic)
                websocket_loop(secure_socket)

        headers_list = request_data.split('\r\n')
        first_line = headers_list[0].split()
        for line in headers_list:
            if line.lower().startswith("content-length:"):
                content_length = int(line.split(':')[1].strip())
            if line.lower().startswith('cookie'):
                auth_token = get_cookie_value(headers_list, "auth_token")
        if auth_token is None:
            pass
        elif auth_token:
            user_id = verify_signed_id(auth_token)
        user_playtime = get_element_from_path(user_id, 'unique_id', 'playtime', user_file_path)
        if len(first_line) < 2:
            secure_socket.close()
            return

        method = first_line[0]
        path = first_line[1]

        print(f"Request: {method} {path}")

        # Post Handel
        if method == 'POST':
            content_length = 0
            for line in headers_list:
                print(line)
                if line.lower().startswith("content-length:"):
                    content_length = int(line.split(':')[1].strip())
                if line.lower().startswith('cookie'):
                    auth_token = (line.split('='))[1]

            body_start = request_data.find('\r\n\r\n') + 4
            body = request_data[body_start : body_start + content_length]
            if path == '/submitScore':
                try:
                    post_data = json.loads(body)
                    username = post_data.get('username')
                    score = post_data.get('score')
                    time_data = post_data.get('time')
                    print('Time Data: ', time_data)
                    if user_playtime is not None:
                        pass
                    time_data = time_data + int(user_playtime)
                    print(f'The User {username} has {time_data} Seconds playtime')
                    set_element_from_path(username,'username','playtime',user_file_path,time_data)
                    scores = read_file(scores_file_path)
                    save_score(scores, username, score, time_data)
                    write_sort_file(scores_file_path, scores, 'score')

                    response_body = json.dumps({"status": "success", "message": "Score submitted!"}).encode()
                    header = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n" \
                            f"Content-Length: {len(response_body)}\r\n\r\n"
                    secure_socket.sendall(header.encode() + response_body)
                except Exception as e:
                    print(f"POST Error: {e}")
                    secure_socket.sendall(b"HTTP/1.1 500 Internal Server Error\r\n\r\n")
            elif path == '/submitCredentials':
                try:
                    post_data = json.loads(body)
                    username = post_data.get('username')
                    password_input = post_data.get('password')
                    objective = post_data.get('objective')
                    return_value = update_users(username,password_input,objective)
                    if objective == 'login':
                        if return_value[0]:
                            if return_value[1]:
                                for entry in read_file(user_file_path):
                                    if entry['username'] == username:
                                        uniqueid = entry['unique_id']
                                        break
                                safe_token = create_signed_id(uniqueid)
                                response_body = json.dumps({"status": "success", "message": "Logged in!"}).encode('utf-8')
                                header = "HTTP/1.1 200 OK\r\n" \
                                        "Content-Type: application/json\r\n" \
                                        f"Content-Length: {len(response_body)}\r\n" \
                                        f"Set-Cookie: auth_token={safe_token}; Path=/; HttpOnly; Secure\r\n" \
                                        "\r\n"
                                secure_socket.sendall(header.encode('utf-8') + response_body)
                            else:
                                response_body = json.dumps({"status": "failure", "message": "Wrong password!"}).encode()
                                header = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n" \
                                    f"Content-Length: {len(response_body)}\r\n\r\n"
                        else:
                            response_body = json.dumps({"status": "failure", "message": "User not found!"}).encode()
                            header = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n" \
                                    f"Content-Length: {len(response_body)}\r\n\r\n"
                    elif objective == 'create':
                        if return_value[0]:
                            response_body = json.dumps({"status": "failure", "message": "Username already exists!"}).encode()
                        else:
                            response_body = json.dumps({"status": "success", "message": "User created!"}).encode()
                        header = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n" \
                                f"Content-Length: {len(response_body)}\r\n\r\n"
                    secure_socket.sendall(header.encode() + response_body)
                except Exception as e:
                    print(f"POST Error: {e}")
                    secure_socket.sendall(b"HTTP/1.1 500 Internal Server Error\r\n\r\n")
            elif path == '/verifyLogin':
                try:
                    auth_token = get_cookie_value(headers_list, "auth_token")
                    if auth_token is None:
                        response_data = {"username": 'Gast', "status": "none"}
                        response_body = json.dumps(response_data).encode('utf-8')
                        header = "HTTP/1.1 200 OK\r\n" \
                                "Content-Type: application/json\r\n" \
                                f"Content-Length: {len(response_body)}\r\n" \
                                "Access-Control-Allow-Origin: *\r\n" \
                                "\r\n"
                        secure_socket.sendall(header.encode('utf-8') + response_body)
                    user_id = verify_signed_id(auth_token) if auth_token else None

                    if user_id:
                        user_file_path = os.path.join(BASE_DIR, 'data', 'users.json')
                        users = read_file(user_file_path)
                        found_username = None
                        for entry in users:
                            if str(entry['unique_id']) == str(user_id):
                                found_username = entry['username']
                                break
                        if found_username:
                            response_data = {"username": found_username, "status": "active"}
                            response_body = json.dumps(response_data).encode('utf-8')
                            header = "HTTP/1.1 200 OK\r\n" \
                                    "Content-Type: application/json\r\n" \
                                    f"Content-Length: {len(response_body)}\r\n" \
                                    "Access-Control-Allow-Origin: *\r\n" \
                                    "\r\n"
                            secure_socket.sendall(header.encode('utf-8') + response_body)
                        else:
                            raise Exception("User ID not found in database")
                    else:
                        print("Verify failed: No valid token")
                        error_body = json.dumps({"error": "Not logged in"}).encode('utf-8')
                        header = "HTTP/1.1 401 Unauthorized\r\n" \
                                "Content-Type: application/json\r\n" \
                                f"Content-Length: {len(error_body)}\r\n" \
                                "Access-Control-Allow-Origin: *\r\n" \
                                "\r\n"
                        secure_socket.sendall(header.encode('utf-8') + error_body)
                except Exception as e:
                    print(f"Login Verify Error: {e}")
                    secure_socket.sendall(b"HTTP/1.1 500 Server Error\r\n\r\n")
            elif path == '/Logout':
                try:
                    auth_token = get_cookie_value(headers_list, "auth_token")
                    if auth_token is None:
                        response_data = {'message': 'User not logged in!'}
                        response_body = json.dumps(response_data).encode('utf-8')
                        header = "HTTP/1.1 200 OK\r\n" \
                                "Content-Type: application/json\r\n" \
                                f"Content-Length: {len(response_body)}\r\n" \
                                "Access-Control-Allow-Origin: *\r\n" \
                                "\r\n"
                        secure_socket.sendall(header.encode('utf-8') + response_body)
                    else:
                        response_data = {'message': 'Logged out!'}
                        response_body = json.dumps(response_data).encode('utf-8')
                        header = "HTTP/1.1 200 OK\r\n" \
                                    "Content-Type: application/json\r\n" \
                                    f"Content-Length: {len(response_body)}\r\n" \
                                    f"Set-Cookie: auth_token=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure\r\n" \
                                    "\r\n"
                        secure_socket.sendall(header.encode('utf-8') + response_body)
                except Exception as e:
                    print(f"Login Verify Error: {e}")
                    secure_socket.sendall(b"HTTP/1.1 500 Server Error\r\n\r\n")
            elif path == '/getGraphData':
                try:
                    post_data = json.loads(body)
                    graph_type = post_data.get('graph')
                    x_axis = post_data.get('x_axis')
                    y_axis = post_data.get('y_axis')
                    el_co_list = get_count_from_json(stat_file_path, 'user_action')
                    get_date_from_timestamp(get_count_from_json(stat_file_path, 'timestamp'))
                    list_1 = []
                    list_2 = []
                    for entry in el_co_list:
                        list_1.append(entry[0])
                        list_2.append(entry[1])
                    response_data = {'list': list_1, 'data': list_2, 'description': x_axis, 'chart_type': graph_type}
                    response_body = json.dumps(response_data).encode('utf-8')
                    print(response_body)
                    header = "HTTP/1.1 200 OK\r\n" \
                             "Content-Type: application/json\r\n" \
                             f"Content-Length: {len(response_body)}\r\n" \
                             "Access-Control-Allow-Origin: *\r\n" \
                             "\r\n"
                    secure_socket.sendall(header.encode('utf-8') + response_body)
                except Exception as e:
                    print(f"Get Graph Error: {e}")
                    secure_socket.sendall(b"HTTP/1.1 500 Server Error\r\n\r\n")
            elif path == '/getShop':
                try:
                    shop = shop_logic.get_shop()
                    print(shop)
                    response_body = json.dumps(shop).encode('utf-8')
                    header = "HTTP/1.1 200 OK\r\n" \
                                    "Content-Type: application/json\r\n" \
                                    f"Content-Length: {len(response_body)}\r\n" \
                                    "\r\n"
                    secure_socket.sendall(header.encode('utf-8') + response_body)
                except Exception as e:
                    print(f"SHOP Error: {e}")
                    secure_socket.sendall(b"HTTP/1.1 500 Server Error\r\n\r\n")
            secure_socket.close()
            return
        #Get handeling
        elif method == 'GET':
            file_path = None
            content_type = 'text/plain'
            content_name = path.split('/')
            content_file = content_name[len(content_name)-1]
            #html
            if path == '/' or path == '/sylas_collection':
                file_path = os.path.join(BASE_DIR, 'html','index.html')
                content_type = 'text/html'
                action = 'main'
            elif path == '/bullethell':
                file_path = os.path.join(BASE_DIR, 'html','gamepage.html')
                content_type = 'text/html'
                action = 'game'
            elif path == '/Account':
                file_path = os.path.join(BASE_DIR, 'html','AccountPage.html')
                content_type = 'text/html'
                action = 'account'
            elif path == '/Leaderboard':
                file_path = os.path.join(BASE_DIR, 'html','scorepage.html')
                content_type = 'text/html'
                action = 'leader'
            elif path == '/Dashboard':
                file_path = os.path.join(BASE_DIR, 'html', 'Dashboard.html')
                content_type = 'text/html'
                action = 'dashboard'
            #css
            elif path == '/css/'+content_file:
                file_path = os.path.join(BASE_DIR, 'css', content_file)
                content_type = 'text/css'
            #js
            elif path == '/js/'+content_file:
                file_path = os.path.join(BASE_DIR, 'js', content_file)
                content_type = 'application/javascript'
            #json
            elif path == '/data/'+content_file:
                file_path = os.path.join(BASE_DIR, 'data', content_file+'.json')
                content_type = 'application/json'
            #other
            elif path == '/favicon.ico':
                file_path = os.path.join(BASE_DIR, 'favicon.ico')
                content_type = 'image/x-icon'
            # Fonts
            elif path == '/fonts/'+content_file:
                file_path = os.path.join(BASE_DIR, 'fonts', content_file)
                content_type = 'font/ttf'
            # Audio Files
            elif path == '/audio/'+content_file:
                file_path = os.path.join(BASE_DIR, 'audio', content_file)
                content_type = 'audio/wav'
            if file_path and os.path.exists(file_path):
                try:
                    is_binary = 'image' in content_type or 'audio' in content_type or 'font' in content_type
                    mode = 'rb' if is_binary else 'r'
                    with open(file_path, mode) as f:
                        content = f.read()
                        if mode == 'r':
                            content = content.encode('utf-8')
                    header = f"HTTP/1.1 200 OK\r\nContent-Type: {content_type}\r\n" \
                             f"Content-Length: {len(content)}\r\n\r\n"
                    secure_socket.sendall(header.encode() + content)
                except Exception as e:
                    print(f"File Error: {e}")
                    secure_socket.sendall(b"HTTP/1.1 500 Internal Server Error\r\n\r\n")
            else:
                print(f"404 Not Found: {path}")
                secure_socket.sendall(b"HTTP/1.1 404 Not Found\r\n\r\n404 Not Found")
        if user_id and action != '-':
            if user_id == 'Gast':
                user_playtime = 0
            statistic_saving(stat_file_path,client_address,user_id,action,user_playtime)
        secure_socket.close()
    except Exception as e:
        print(f"Handler Error: {e}")
        if 'secure_socket' in locals():
            secure_socket.close()

# --- MAIN SERVER LOOP ---

def start_server():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind((SERVER_HOST, SERVER_PORT))
    server_socket.listen(5)

    print(f'Secure Server listening on https://{socket.gethostbyname(socket.gethostname())}:{SERVER_PORT}')
    print(f'Serving files from: {BASE_DIR}')

    while True:
        try:
            raw_socket, client_address = server_socket.accept()

            # Wrap the socket for SSL
            try:
                secure_socket = SSL_CONTEXT.wrap_socket(raw_socket, server_side=True)
            except ssl.SSLError as e:
                print(f"SSL Handshake failed: {e}")
                raw_socket.close()
                continue

            print(f" --- Accepted SECURE connection from: {client_address} ---")

            client_handler = threading.Thread(target=handle_client, args=(secure_socket,client_address))
            client_handler.start()

        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"Server Loop Error: {e}")

if __name__ == "__main__":
    get_log_span()
    start_server()

# TODO
# Enemy handling auf dem Server please. → Generiert Gegner mit id, welche dem Client geschickt werden und alle hits werden an den Server gesendet via Requests.
# Wichtig ist die id für die gegner, damit der selbe gegner nur einmal besiegt werden kann
# demnach hat der Server ne DB für alle gegner und "Spielende" - Score und alles kann dann auf dem Server gehandelt werden und wird nur an den Spieler geschickt.
# → Websocket wäre natürlich ganz nett aber für die größe kein muss
# add entry to stat when player is game over to calculate playtime instead of current version because player can close website without going on index.html
# Wenn enemy handling auf dem Server ist muss dann natürlich auch alles andere dort sein um ein Faires environment zu haben...
# ||| dann aber bitte in extra Scripts |||