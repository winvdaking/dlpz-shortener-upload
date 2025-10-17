<?php

namespace App\Entity;

class Url
{
    private string $original;
    private string $shortCode;
    private \DateTime $createdAt;
    private int $clicks;

    public function __construct(string $original, string $shortCode)
    {
        $this->original = $original;
        $this->shortCode = $shortCode;
        $this->createdAt = new \DateTime();
        $this->clicks = 0;
    }

    public function getOriginal(): string
    {
        return $this->original;
    }

    public function setOriginal(string $original): self
    {
        $this->original = $original;
        return $this;
    }

    public function getShortCode(): string
    {
        return $this->shortCode;
    }

    public function setShortCode(string $shortCode): self
    {
        $this->shortCode = $shortCode;
        return $this;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTime $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getClicks(): int
    {
        return $this->clicks;
    }

    public function setClicks(int $clicks): self
    {
        $this->clicks = $clicks;
        return $this;
    }

    public function incrementClicks(): self
    {
        $this->clicks++;
        return $this;
    }

    public function toArray(): array
    {
        return [
            'original' => $this->original,
            'short' => $this->shortCode,
            'createdAt' => $this->createdAt->format('Y-m-d H:i:s'),
            'clicks' => $this->clicks,
        ];
    }

    public static function fromArray(array $data): self
    {
        $url = new self($data['original'], $data['short']);
        $url->setCreatedAt(new \DateTime($data['createdAt']));
        $url->setClicks($data['clicks'] ?? 0);
        return $url;
    }
}
