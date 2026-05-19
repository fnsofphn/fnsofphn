$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.Drawing

$repo = Split-Path -Parent $PSScriptRoot
$sourceDir = Join-Path $repo "project content\De thi giup Cy\de tuan 2-20260519T012310Z-3-001\de tuan 2"
$publicRoot = Join-Path $repo "public\exam-assets\week-2"
$dataPath = Join-Path $repo "features\giup-cy\week-2-exams.json"
$assetPath = Join-Path $repo "features\giup-cy\week-2-assets.json"

$w = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
$a = "http://schemas.openxmlformats.org/drawingml/2006/main"
$r = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
$relNs = "http://schemas.openxmlformats.org/package/2006/relationships"
$cauPattern = "C" + [char]0x00E2 + "u"

function Normalize-Text([string]$value) {
  if ($null -eq $value) { return "" }
  return ($value -replace "\s+", " ").Trim()
}

function Get-Slug([string]$name) {
  $normalized = $name.ToLowerInvariant().Normalize([Text.NormalizationForm]::FormD)
  $chars = New-Object System.Text.StringBuilder
  foreach ($ch in $normalized.ToCharArray()) {
    $category = [Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch)
    if ($category -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
      [void]$chars.Append($ch)
    }
  }
  $ascii = $chars.ToString() -replace "đ", "d"
  return (($ascii -replace "[^a-z0-9]+", "-").Trim("-"))
}

function Get-QuestionKind([string]$section, [int]$localNumber) {
  if ($localNumber -eq 18) { return "single_choice" }
  if ($section -eq "Phần I" -and $localNumber -le 18) { return "single_choice" }
  if ($section -eq "Phần II" -or ($localNumber -ge 19 -and $localNumber -le 22)) { return "true_false" }
  return "short_answer"
}

function Get-GlobalNumber([string]$section, [int]$localNumber) {
  if ($localNumber -eq 18) { return 18 }
  if ($section -eq "Phần I" -and $localNumber -le 18) { return $localNumber }
  if ($localNumber -ge 19) { return $localNumber }
  if ($section -eq "Phần II") { return 18 + $localNumber }
  if ($section -eq "Phần III") { return 22 + $localNumber }
  return $localNumber
}

function Split-Options([string[]]$lines) {
  $joined = ($lines -join "`n")
  $matches = [regex]::Matches($joined, "(?ms)(^|\s)([A-D])\.\s*(.*?)(?=(\s[A-D]\.\s)|$)")
  if ($matches.Count -ge 4) {
    $items = @()
    foreach ($m in $matches) {
      $items += [ordered]@{
        key = $m.Groups[2].Value
        text = (Normalize-Text $m.Groups[3].Value)
      }
    }
    return $items | Select-Object -First 4
  }

  if ($lines.Count -ge 4) {
    $tail = $lines | Select-Object -Last 4
    $keys = @("A", "B", "C", "D")
    $items = @()
    for ($i = 0; $i -lt 4; $i++) {
      $items += [ordered]@{ key = $keys[$i]; text = (Normalize-Text $tail[$i]) }
    }
    return $items
  }

  return @()
}

function Get-PromptWithoutOptions([string[]]$lines, [string]$kind) {
  if ($kind -eq "short_answer") { return (Normalize-Text ($lines -join "`n")) }
  if ($kind -eq "true_false" -and $lines.Count -gt 4) {
    return (Normalize-Text (($lines | Select-Object -First ($lines.Count - 4)) -join "`n"))
  }

  $joined = ($lines -join "`n")
  $firstOption = [regex]::Match($joined, "(?ms)(^|\s)A\.\s*")
  if ($firstOption.Success) {
    return (Normalize-Text $joined.Substring(0, $firstOption.Index))
  }

  if ($kind -eq "single_choice" -and $lines.Count -gt 4) {
    return (Normalize-Text (($lines | Select-Object -First ($lines.Count - 4)) -join "`n"))
  }

  return (Normalize-Text $joined)
}

function New-Question([string]$section, [int]$localNumber, [string[]]$lines, [int]$sortOrder) {
  $globalNumber = Get-GlobalNumber $section $localNumber
  $kind = Get-QuestionKind $section $globalNumber
  $options = @()
  if ($kind -eq "single_choice") {
    $options = @(Split-Options $lines)
  } elseif ($kind -eq "true_false") {
    $tail = if ($lines.Count -ge 4) { $lines | Select-Object -Last 4 } else { @() }
    $keys = @("a", "b", "c", "d")
    for ($i = 0; $i -lt [Math]::Min(4, $tail.Count); $i++) {
      $options += [ordered]@{ key = $keys[$i]; text = (Normalize-Text $tail[$i]) }
    }
  }

  $points = if ($kind -eq "single_choice") { 0.25 } elseif ($kind -eq "true_false") { 1 } else { 0.5 }
  return [ordered]@{
    section = $section
    question_number = $globalNumber
    question_type = $kind
    prompt = (Get-PromptWithoutOptions $lines $kind)
    options = $options
    correct_answer = $null
    points = $points
    needs_review = $true
    explanation = "Đề được nhập từ Word tuần 2; đáp án cần rà soát thủ công để tránh lỗi công thức/hình."
    sort_order = $sortOrder
  }
}

function Save-CombinedImage($images, [string]$targetPath) {
  if ($images.Count -eq 0) { return $null }

  $bitmaps = @()
  try {
    foreach ($imagePath in $images) {
      $bitmaps += [Drawing.Bitmap]::FromFile($imagePath)
    }

    $width = ($bitmaps | Measure-Object -Property Width -Maximum).Maximum
    $height = (($bitmaps | Measure-Object -Property Height -Sum).Sum + (($bitmaps.Count - 1) * 24))
    $canvas = New-Object Drawing.Bitmap([int]$width, [int]$height)
    $graphics = [Drawing.Graphics]::FromImage($canvas)
    $graphics.Clear([Drawing.Color]::White)
    $y = 0
    foreach ($bmp in $bitmaps) {
      $x = [int](($width - $bmp.Width) / 2)
      $graphics.DrawImage($bmp, $x, $y, $bmp.Width, $bmp.Height)
      $y += $bmp.Height + 24
    }
    $graphics.Dispose()
    $canvas.Save($targetPath, [Drawing.Imaging.ImageFormat]::Png)
    $canvas.Dispose()

    $result = [Drawing.Bitmap]::FromFile($targetPath)
    try {
      return [ordered]@{ width = $result.Width; height = $result.Height }
    } finally {
      $result.Dispose()
    }
  } finally {
    foreach ($bmp in $bitmaps) { $bmp.Dispose() }
  }
}

New-Item -ItemType Directory -Force -Path $publicRoot | Out-Null
$exams = @()
$assets = [ordered]@{}

$index = 1
foreach ($file in Get-ChildItem -LiteralPath $sourceDir -Filter *.docx | Sort-Object Name) {
  $base = [IO.Path]::GetFileNameWithoutExtension($file.Name)
  $slug = Get-Slug $base
  $assetDir = Join-Path $publicRoot $slug
  $mediaDir = Join-Path $assetDir "media"
  New-Item -ItemType Directory -Force -Path $mediaDir | Out-Null

  $zip = [IO.Compression.ZipFile]::OpenRead($file.FullName)
  try {
    $docEntry = $zip.GetEntry("word/document.xml")
    $reader = New-Object IO.StreamReader($docEntry.Open(), [Text.Encoding]::UTF8)
    [xml]$xml = $reader.ReadToEnd()
    $reader.Close()

    $relsEntry = $zip.GetEntry("word/_rels/document.xml.rels")
    $reader = New-Object IO.StreamReader($relsEntry.Open(), [Text.Encoding]::UTF8)
    [xml]$relsXml = $reader.ReadToEnd()
    $reader.Close()

    $relMap = @{}
    foreach ($rel in $relsXml.Relationships.Relationship) {
      $relMap[$rel.Id] = $rel.Target
    }

    $nsm = New-Object Xml.XmlNamespaceManager($xml.NameTable)
    $nsm.AddNamespace("w", $w)
    $nsm.AddNamespace("a", $a)
    $nsm.AddNamespace("r", $r)

    $currentSection = "Phần I"
    $currentLocal = $null
    $currentQuestionSection = "Phần I"
    $currentLines = New-Object System.Collections.Generic.List[string]
    $questions = @()
    $sortOrder = 1
    $questionImages = @{}
    $beforeSolutions = $true

    foreach ($p in $xml.SelectNodes("//w:p", $nsm)) {
      $text = (($p.SelectNodes(".//w:t", $nsm) | ForEach-Object { $_."#text" }) -join "")
      $clean = Normalize-Text $text
      if (-not $clean) {
        if ($null -ne $currentLocal) {
          $globalNumber = Get-GlobalNumber $currentQuestionSection $currentLocal
          foreach ($blip in $p.SelectNodes(".//a:blip", $nsm)) {
            $rid = $blip.GetAttribute("embed", $r)
            if (-not $rid -or -not $relMap.ContainsKey($rid)) { continue }

            $target = $relMap[$rid] -replace "^/", ""
            $entryPath = if ($target.StartsWith("media/")) { "word/$target" } else { "word/$target" }
            $entry = $zip.GetEntry($entryPath)
            if (-not $entry) { continue }

            $ext = [IO.Path]::GetExtension($entry.Name)
            $outName = "q$globalNumber-$rid$ext"
            $outPath = Join-Path $mediaDir $outName
            $stream = $entry.Open()
            try {
              $fs = [IO.File]::Create($outPath)
              try { $stream.CopyTo($fs) } finally { $fs.Dispose() }
            } finally {
              $stream.Dispose()
            }

            if (-not $questionImages.ContainsKey($globalNumber)) {
              $questionImages[$globalNumber] = New-Object System.Collections.Generic.List[string]
            }
            $questionImages[$globalNumber].Add($outPath)
          }
        }
        continue
      }
      if ($clean -match "H.{0,3}NG\s*D.{0,3}N\s*GI.{0,3}I") { break }

      $questionCandidates = @()
      foreach ($candidate in [regex]::Matches($clean, "$cauPattern\s*(\d+)\s*[\.:]")) {
        $prefixStart = [Math]::Max(0, $candidate.Index - 16)
        $prefix = $clean.Substring($prefixStart, $candidate.Index - $prefixStart).ToLowerInvariant()
        if ($prefix -notmatch "từ|tu|đến|den") {
          $questionCandidates += $candidate
        }
      }
      $sectionIIMatch = [regex]::Match($clean, "PH.{0,3}N\s*II")
      $sectionIIIMatch = [regex]::Match($clean, "PH.{0,3}N\s*III")

      if ($questionCandidates.Count -eq 0) {
        if ($sectionIIMatch.Success) { $currentSection = "Phần II" }
        if ($sectionIIIMatch.Success) { $currentSection = "Phần III" }
        if ($null -ne $currentLocal) { $currentLines.Add($clean) }
      } else {
        for ($candidateIndex = 0; $candidateIndex -lt $questionCandidates.Count; $candidateIndex++) {
          $questionMatch = $questionCandidates[$candidateIndex]
          if ($sectionIIMatch.Success -and $sectionIIMatch.Index -lt $questionMatch.Index) { $currentSection = "Phần II" }
          if ($sectionIIIMatch.Success -and $sectionIIIMatch.Index -lt $questionMatch.Index) { $currentSection = "Phần III" }

          if ($candidateIndex -eq 0 -and $null -ne $currentLocal -and $questionMatch.Index -gt 0) {
            $leading = $clean.Substring(0, $questionMatch.Index).Trim()
            if ($leading) { $currentLines.Add($leading) }
          }

          if ($null -ne $currentLocal -and $currentLines.Count -gt 0) {
            $questions += New-Question $currentQuestionSection $currentLocal ($currentLines.ToArray()) $sortOrder
            $sortOrder++
            $currentLines.Clear()
          }

          $currentLocal = [int]$questionMatch.Groups[1].Value
          $currentQuestionSection = $currentSection
          $segmentStart = $questionMatch.Index + $questionMatch.Length
          $segmentEnd = if ($candidateIndex + 1 -lt $questionCandidates.Count) { $questionCandidates[$candidateIndex + 1].Index } else { $clean.Length }
          $afterMarker = $clean.Substring($segmentStart, $segmentEnd - $segmentStart)
          if ($afterMarker.Trim()) { $currentLines.Add($afterMarker.Trim()) }
        }

        $lastQuestionMatch = $questionCandidates[$questionCandidates.Count - 1]
        if ($sectionIIMatch.Success -and $sectionIIMatch.Index -gt $lastQuestionMatch.Index) { $currentSection = "Phần II" }
        if ($sectionIIIMatch.Success -and $sectionIIIMatch.Index -gt $lastQuestionMatch.Index) { $currentSection = "Phần III" }
      }

      if ($null -ne $currentLocal) {
        $globalNumber = Get-GlobalNumber $currentQuestionSection $currentLocal
        foreach ($blip in $p.SelectNodes(".//a:blip", $nsm)) {
          $rid = $blip.GetAttribute("embed", $r)
          if (-not $rid -or -not $relMap.ContainsKey($rid)) { continue }

          $target = $relMap[$rid] -replace "^/", ""
          $entryPath = if ($target.StartsWith("media/")) { "word/$target" } else { "word/$target" }
          $entry = $zip.GetEntry($entryPath)
          if (-not $entry) { continue }

          $ext = [IO.Path]::GetExtension($entry.Name)
          $outName = "q$globalNumber-$rid$ext"
          $outPath = Join-Path $mediaDir $outName
          $stream = $entry.Open()
          try {
            $fs = [IO.File]::Create($outPath)
            try { $stream.CopyTo($fs) } finally { $fs.Dispose() }
          } finally {
            $stream.Dispose()
          }

          if (-not $questionImages.ContainsKey($globalNumber)) {
            $questionImages[$globalNumber] = New-Object System.Collections.Generic.List[string]
          }
          $questionImages[$globalNumber].Add($outPath)
        }
      }
    }

    if ($null -ne $currentLocal -and $currentLines.Count -gt 0) {
      $questions += New-Question $currentQuestionSection $currentLocal ($currentLines.ToArray()) $sortOrder
    }

    $dedupedQuestions = @()
    foreach ($group in ($questions | Group-Object { $_.question_number } | Sort-Object { [int]$_.Name })) {
      $dedupedQuestions += ($group.Group | Sort-Object { $_.prompt.Length } -Descending | Select-Object -First 1)
    }
    $questions = @($dedupedQuestions | Sort-Object { $_.question_number })
    for ($questionIndex = 0; $questionIndex -lt $questions.Count; $questionIndex++) {
      $questions[$questionIndex].sort_order = $questionIndex + 1
    }

    $assetQuestions = [ordered]@{}
    foreach ($questionNumber in $questionImages.Keys) {
      $combined = Join-Path $mediaDir "q$questionNumber.png"
      $size = Save-CombinedImage $questionImages[$questionNumber] $combined
      if ($size) {
        $assetQuestions["$questionNumber"] = [ordered]@{
          pageNumber = 1
          url = "/exam-assets/week-2/$slug/media/q$questionNumber.png?v=week-2-20260519"
          width = $size.width
          height = $size.height
        }
      }
    }

    $assets[$slug] = [ordered]@{
      slug = $slug
      sourceFileName = $file.Name
      questionAssets = $assetQuestions
    }

    $titlePrefix = "{0:00}.05.{1:00}" -f 19, $index
    $exams += [ordered]@{
      title = $titlePrefix
      description = "Đề tuần 2 được nhập từ file Word gốc. Các câu có công thức/hình được giữ ảnh nhúng từ Word; đáp án đang để rà soát để tránh chấm sai."
      subject = "Hóa học"
      duration_minutes = 50
      slugSuffix = "$slug-week-2"
      source_file_name = $file.Name
      is_active = $true
      questions = $questions
    }
  } finally {
    $zip.Dispose()
  }

  $index++
}

$jsonOptions = @{ Depth = 100; Compress = $false }
[IO.File]::WriteAllText($dataPath, ($exams | ConvertTo-Json @jsonOptions), [Text.UTF8Encoding]::new($false))
[IO.File]::WriteAllText($assetPath, ($assets | ConvertTo-Json @jsonOptions), [Text.UTF8Encoding]::new($false))

Write-Host "Generated $($exams.Count) exams -> $dataPath"
Write-Host "Generated assets -> $assetPath"
