<?php

use Symfony\Component\Runtime\SymfonyRuntime;

$_SERVER['APP_RUNTIME'] = SymfonyRuntime::class;
$_SERVER['APP_RUNTIME_OPTIONS'] = [
    'disable_dotenv' => false,
    'prod_envs' => ['prod'],
    'test_envs' => ['test'],
];

require_once dirname(__DIR__).'/vendor/autoload_runtime.php';
