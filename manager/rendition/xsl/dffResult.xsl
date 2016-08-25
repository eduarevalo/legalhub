<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" version="1.0">
<xsl:output omit-xml-declaration="yes"/>
    <xsl:template match="diff/*">
        <xsl:copy-of select="."/>
    </xsl:template>
</xsl:stylesheet>
