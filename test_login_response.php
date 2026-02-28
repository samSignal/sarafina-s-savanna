<?php
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;

require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Ensure admin user exists
$email = 'admin@sarafina.africa';
$password = 'password';
$user = User::where('email', $email)->first();
if (!$user) {
    $user = User::create([
        'name' => 'Admin Test',
        'email' => $email,
        'password' => Hash::make($password),
        'role' => 'admin',
    ]);
} else {
    $user->password = Hash::make($password);
    $user->role = 'admin';
    $user->save();
}

// Mock request
$request = Request::create('/api/auth/login', 'POST', [
    'email' => $email,
    'password' => $password,
]);

$controller = new AuthController();
$response = $controller->login($request);

$content = $response->getContent();
$data = json_decode($content, true);

if (isset($data['user']['role']) && $data['user']['role'] === 'admin') {
    echo "SUCCESS: Role returned in login response.\n";
} else {
    echo "FAILURE: Role NOT returned or incorrect.\n";
    print_r($data);
}
