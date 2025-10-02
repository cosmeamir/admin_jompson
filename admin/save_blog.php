<?php
require_once __DIR__ . '/config.php';
ensure_logged_in();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: dashboard.php');
    exit;
}

$action = $_POST['action'] ?? '';
$data = load_data();
$blogs = $data['blogs'];

if ($action === 'create' || $action === 'update') {
    $title = trim($_POST['title'] ?? '');
    $date = trim($_POST['date'] ?? '');
    $author = trim($_POST['author'] ?? '');
    $image = trim($_POST['image'] ?? '');
    $excerpt = trim($_POST['excerpt'] ?? '');
    $content = trim($_POST['content'] ?? '');

    if ($title === '' || $date === '' || $author === '' || $image === '' || $excerpt === '' || $content === '') {
        header('Location: dashboard.php');
        exit;
    }

    $slug = slugify($title);
    if ($action === 'update') {
        $originalSlug = $_POST['slug'] ?? '';
        $existingSlugs = array_column($blogs, 'slug');
        $existingSlugs = array_values(array_filter($existingSlugs, static function ($value) use ($originalSlug) {
            return $value !== $originalSlug;
        }));

        $baseSlug = $slug ?: $originalSlug;
        if ($baseSlug === '') {
            $baseSlug = 'post-' . uniqid();
        }

        $candidate = $baseSlug;
        $counter = 2;
        while (in_array($candidate, $existingSlugs, true)) {
            $candidate = $baseSlug . '-' . $counter++;
        }

        foreach ($blogs as &$blog) {
            if ($blog['slug'] === $originalSlug) {
                $blog = [
                    'slug' => $candidate,
                    'title' => $title,
                    'date' => $date,
                    'author' => $author,
                    'image' => $image,
                    'excerpt' => $excerpt,
                    'content' => $content,
                ];
                break;
            }
        }
        unset($blog);
    } else {
        $existingSlugs = array_column($blogs, 'slug');
        $baseSlug = $slug;
        $counter = 2;
        while (in_array($slug, $existingSlugs, true)) {
            $slug = $baseSlug . '-' . $counter++;
        }
        $blogs[] = [
            'slug' => $slug,
            'title' => $title,
            'date' => $date,
            'author' => $author,
            'image' => $image,
            'excerpt' => $excerpt,
            'content' => $content,
        ];
    }
}

if ($action === 'delete') {
    $slug = $_POST['slug'] ?? '';
    $blogs = array_values(array_filter($blogs, static function ($blog) use ($slug) {
        return $blog['slug'] !== $slug;
    }));
}

usort($blogs, static function ($a, $b) {
    return strcmp($b['date'], $a['date']);
});

$data['blogs'] = $blogs;
save_data($data);
header('Location: dashboard.php');
exit;
