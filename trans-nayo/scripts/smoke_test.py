"""Test de fumée sur émulateur Android : installe l'APK, parcourt l'inscription,
l'accueil et la commande d'une course, prend des captures et échoue en cas de plantage.

Usage : python3 smoke_test.py <apk> <dossier_de_sortie>
"""
import os
import re
import subprocess
import sys
import time

PACKAGE = 'com.transnayo.app'
APK, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)


def adb(*args, check=True):
    return subprocess.run(['adb', *args], capture_output=True, text=True, check=check).stdout


def screenshot(name):
    with open(os.path.join(OUT, f'{name}.png'), 'wb') as f:
        f.write(subprocess.run(['adb', 'exec-out', 'screencap', '-p'], capture_output=True, check=True).stdout)
    print(f'capture : {name}.png')


def nodes():
    """Liste (texte, classe, centre) des éléments visibles à l'écran."""
    for _ in range(5):
        adb('shell', 'uiautomator', 'dump', '/sdcard/ui.xml', check=False)
        xml = adb('shell', 'cat', '/sdcard/ui.xml', check=False)
        if '<hierarchy' in xml:
            break
        time.sleep(2)
    result = []
    for m in re.finditer(r'<node [^>]*?text="([^"]*)"[^>]*?class="([^"]*)"[^>]*?bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"', xml):
        text, cls, x1, y1, x2, y2 = m.group(1), m.group(2), *map(int, m.groups()[2:])
        result.append((text, cls, ((x1 + x2) // 2, (y1 + y2) // 2)))
    return result


def wait_for(predicate, label, timeout=90):
    deadline = time.time() + timeout
    while time.time() < deadline:
        assert_alive()
        for node in nodes():
            if predicate(node):
                return node
        time.sleep(2)
    screenshot(f'echec-{label}')
    print('Textes visibles :', [n[0] for n in nodes() if n[0]])
    raise SystemExit(f'Élément introuvable : {label}')


def hide_keyboard():
    """Ferme le clavier s'il est ouvert, pour ne pas taper dessus par erreur."""
    if 'mInputShown=true' in adb('shell', 'dumpsys', 'input_method', check=False):
        adb('shell', 'input', 'keyevent', '4')
        time.sleep(1)


def tap_text(text, exact=True):
    hide_keyboard()
    match = (lambda n: n[0] == text) if exact else (lambda n: n[0].startswith(text))
    node = wait_for(match, text)
    adb('shell', 'input', 'tap', str(node[2][0]), str(node[2][1]))
    time.sleep(1.5)


def type_into(index, value):
    fields = [n for n in nodes() if n[1] == 'android.widget.EditText']
    x, y = fields[index][2]
    adb('shell', 'input', 'tap', str(x), str(y))
    time.sleep(0.8)
    adb('shell', 'input', 'text', value)
    time.sleep(0.8)


def assert_alive():
    if not adb('shell', 'pidof', PACKAGE, check=False).strip():
        if not dump_logs():
            log = adb('logcat', '-d', check=False).splitlines()
            print('----- logcat (fin) -----')
            print('\n'.join(l for l in log[-300:] if PACKAGE in l or ' E ' in l or ' F ' in l))
        raise SystemExit("L'application s'est arrêtée (plantage).")


CRASH_TAGS = ('AndroidRuntime', 'ReactNativeJS', 'DEBUG', 'linker', 'libc', 'SoLoader', 'ReactNative', 'Expo', 'ActivityManager')


def dump_logs():
    log = adb('logcat', '-d', check=False)
    with open(os.path.join(OUT, 'logcat.txt'), 'w') as f:
        f.write(log)
    errors = [l for l in log.splitlines() if 'FATAL EXCEPTION' in l or ('ReactNativeJS' in l and ' E ' in l)]
    if errors:
        # Affiche le contexte dans les journaux du workflow pour faciliter le diagnostic.
        relevant = [l for l in log.splitlines() if any(t in l for t in CRASH_TAGS) and (' E ' in l or ' F ' in l or 'FATAL' in l)]
        print('----- logcat (erreurs) -----')
        print('\n'.join(relevant[-150:]))
        print('----------------------------')
    return errors


print('ABI émulateur :', adb('shell', 'getprop', 'ro.product.cpu.abilist').strip())
adb('install', '-r', APK)
adb('logcat', '-c')
adb('shell', 'monkey', '-p', PACKAGE, '-c', 'android.intent.category.LAUNCHER', '1')
time.sleep(8)

wait_for(lambda n: n[0] == 'Commencer', 'Commencer', timeout=120)
screenshot('1-bienvenue')
tap_text('Commencer')

wait_for(lambda n: n[0] == 'Créez votre compte', 'connexion')
type_into(0, 'Marie%sTshala')
type_into(1, '812345678')
screenshot('2-connexion')
tap_text('Recevoir le code')

wait_for(lambda n: n[0] == 'Code de vérification', 'verification')
adb('shell', 'input', 'text', '1234')
time.sleep(1)
tap_text('Vérifier')

wait_for(lambda n: n[0] == 'Où allez-vous ?', 'accueil')
time.sleep(10)  # laisse le temps aux tuiles de la carte de se charger
screenshot('3-accueil')

tap_text('Maison')
wait_for(lambda n: n[0] == 'Choisissez votre course', 'options')
time.sleep(6)
screenshot('4-choix-course')

tap_text('Commander', exact=False)
time.sleep(12)
screenshot('5-suivi-course')

assert_alive()
errors = dump_logs()
if errors:
    print('\n'.join(errors))
    raise SystemExit('Erreurs détectées dans les journaux.')
print('Test de fumée réussi.')
