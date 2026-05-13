<?php
// api/index.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database Connection (SQLite)
$dbFile = __DIR__ . '/database.sqlite';
$isNew = !file_exists($dbFile);
$pdo = new PDO('sqlite:' . $dbFile);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Initialize DB if new
// Initialize DB Tables (Always run IF NOT EXISTS)
$pdo->exec("
    CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        salary INTEGER NOT NULL,
        attendance INTEGER NOT NULL,
        initials TEXT NOT NULL,
        color1 TEXT NOT NULL,
        color2 TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        client TEXT NOT NULL,
        issue_date TEXT NOT NULL,
        due_date TEXT NOT NULL,
        amount INTEGER NOT NULL,
        status TEXT NOT NULL,
        payment_method TEXT
    );
    
    CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        amount INTEGER NOT NULL,
        date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        min_quantity INTEGER NOT NULL,
        price INTEGER NOT NULL,
        status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        client TEXT NOT NULL,
        items_count INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        status TEXT NOT NULL,
        date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS leaves (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        emp_name TEXT NOT NULL,
        days INTEGER NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        total_orders INTEGER DEFAULT 0,
        total_spent INTEGER DEFAULT 0,
        status TEXT NOT NULL
    );
");

// Insert Dummy Data only if new
if ($isNew) {
    $pdo->exec("
        INSERT INTO customers (name, email, phone, total_orders, total_spent, status) VALUES 
        ('شركة النور المحدودة', 'info@alnoor.sa', '0501234567', 12, 45000, 'active'),
        ('مؤسسة البيان التجارية', 'contact@albayan.com', '0559876543', 8, 22400, 'active'),
        ('مجموعة العليان التجارية', 'sales@al-olayan.com', '0540001122', 15, 89000, 'active'),
        ('شركة ذكاء للتقنية', 'hr@intelligence.com', '0566677788', 3, 12500, 'inactive');

        INSERT INTO employees (name, role, salary, attendance, initials, color1, color2) VALUES 
        ('م. صلاح سمير', 'مدير النظام · تقنية المعلومات', 22000, 98, 'SS', '#4f7cff', '#a78bfa'),
        ('أحمد محمود', 'مطور برمجيات · تقنية المعلومات', 18500, 95, 'AM', '#22d3a0', '#4f7cff'),
        ('سارة محمد', 'أخصائية تسويق · التسويق', 12500, 92, 'SM', '#ff4f6a', '#a78bfa');

        INSERT INTO invoices (id, client, issue_date, due_date, amount, status, payment_method) VALUES 
        ('INV-0245', 'شركة جرير للتسويق', '10 مايو 2026', '25 مايو 2026', 125000, 'pending', 'تحويل بنكي'),
        ('INV-0244', 'مجموعة العليان', '9 مايو 2026', '20 مايو 2026', 84000, 'success', 'فيزا');
        
        INSERT INTO expenses (description, category, amount, date) VALUES 
        ('إيجار المقر الرئيسي', 'تشغيلية', 25000, '1 مايو 2026');

        INSERT INTO products (name, category, quantity, min_quantity, price, status) VALUES 
        ('لابتوب Dell XPS 15', 'إلكترونيات', 12, 5, 6500, 'success'),
        ('هاتف iPhone 15 Pro', 'هواتف', 24, 10, 4200, 'success');

        INSERT INTO orders (id, client, items_count, amount, status, date) VALUES 
        ('#ORD-4825', 'مكتبة جرير', 45, 185000, 'success', '10 مايو');

        INSERT INTO leaves (emp_name, days, date, status) VALUES 
        ('أحمد محمود', 3, '1 مايو 2026', 'مقبول');
    ");
}

$action = $_GET['action'] ?? '';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if ($action === 'employees') {
            $stmt = $pdo->query("SELECT * FROM employees ORDER BY id ASC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } 
        elseif ($action === 'invoices') {
            $stmt = $pdo->query("SELECT * FROM invoices ORDER BY id DESC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        elseif ($action === 'expenses') {
            $stmt = $pdo->query("SELECT * FROM expenses ORDER BY id DESC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        elseif ($action === 'products') {
            $stmt = $pdo->query("SELECT * FROM products ORDER BY id DESC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        elseif ($action === 'orders') {
            $stmt = $pdo->query("SELECT * FROM orders ORDER BY id DESC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        elseif ($action === 'leaves') {
            $stmt = $pdo->query("SELECT * FROM leaves ORDER BY id DESC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        elseif ($action === 'customers') {
            $stmt = $pdo->query("SELECT * FROM customers ORDER BY total_spent DESC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        else {
            echo json_encode(['error' => 'Invalid GET action']);
        }
    } 
    elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        if ($action === 'add_employee') {
            $stmt = $pdo->prepare("INSERT INTO employees (name, role, salary, attendance, initials, color1, color2) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$data['name'], $data['role'], $data['salary'], $data['attendance'], $data['initials'], $data['color1'], $data['color2']]);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        }
        elseif ($action === 'delete_employee') {
            $stmt = $pdo->prepare("DELETE FROM employees WHERE id = ?");
            $stmt->execute([$data['id']]);
            echo json_encode(['success' => true]);
        }
        elseif ($action === 'mark_invoice_paid') {
            $stmt = $pdo->prepare("UPDATE invoices SET status = 'success' WHERE id = ?");
            $stmt->execute([$data['id']]);
            echo json_encode(['success' => true]);
        }
        elseif ($action === 'add_invoice') {
            $stmt = $pdo->prepare("INSERT INTO invoices (id, client, issue_date, due_date, amount, status, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$data['id'], $data['client'], $data['issue_date'], $data['due_date'], $data['amount'], $data['status'], $data['payment_method']]);
            echo json_encode(['success' => true]);
        }
        elseif ($action === 'add_product') {
            $stmt = $pdo->prepare("INSERT INTO products (name, category, quantity, min_quantity, price, status) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$data['name'], $data['category'], $data['quantity'], $data['min_quantity'], $data['price'], $data['status']]);
            echo json_encode(['success' => true]);
        }
        elseif ($action === 'add_order') {
            $pdo->beginTransaction();
            try {
                $stmt = $pdo->prepare("INSERT INTO orders (id, client, items_count, amount, status, date) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$data['id'], $data['client'], $data['items_count'], $data['amount'], $data['status'], $data['date']]);
                
                // Link: Decrease product quantity in Inventory
                if (isset($data['product_id'])) {
                    $stmt2 = $pdo->prepare("UPDATE products SET quantity = quantity - ? WHERE id = ?");
                    $stmt2->execute([$data['items_count'], $data['product_id']]);
                }
                
                $pdo->commit();
                echo json_encode(['success' => true]);
            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }
        }
        elseif ($action === 'add_expense') {
            $stmt = $pdo->prepare("INSERT INTO expenses (description, category, amount, date) VALUES (?, ?, ?, ?)");
            $stmt->execute([$data['description'], $data['category'], $data['amount'], $data['date']]);
            echo json_encode(['success' => true]);
        }
        elseif ($action === 'add_customer') {
            $stmt = $pdo->prepare("INSERT INTO customers (name, email, phone, total_orders, total_spent, status) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$data['name'], $data['email'], $data['phone'], $data['total_orders'] ?? 0, $data['total_spent'] ?? 0, $data['status'] ?? 'active']);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        }
        elseif ($action === 'update_settings') {
            // For demo, we just return success, but in real case you'd save to a 'settings' table
            echo json_encode(['success' => true]);
        }
        elseif ($action === 'add_leave') {
            $stmt = $pdo->prepare("INSERT INTO leaves (emp_name, days, date, status) VALUES (?, ?, ?, 'معلق')");
            $stmt->execute([$data['emp_name'], $data['days'], date('Y-m-d')]);
            echo json_encode(['success' => true]);
        }
        else {
            echo json_encode(['error' => 'Invalid POST action']);
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
