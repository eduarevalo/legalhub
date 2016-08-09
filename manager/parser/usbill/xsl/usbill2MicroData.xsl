<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
    xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl"
    version="2.0" >
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p><xd:b>Created on:</xd:b> Aug 8, 2016</xd:p>
            <xd:p><xd:b>Author:</xd:b> arevalo</xd:p>
            <xd:p></xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:output indent="yes"></xsl:output>
    <xsl:template match="/">
        <div itemscope="" itemtype="usbill">
            <xsl:apply-templates/>
        </div>
    </xsl:template>
    <xsl:template match="metadata|form|attestation" mode="block"/>
    <xsl:template match="*[child::enum|child::header]" mode="block">
        <p>
            <xsl:attribute name="itemtype">
                <xsl:value-of select="name()"/>
            </xsl:attribute>
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates select="enum|header|text" mode="inline"/>
        </p>
        <xsl:apply-templates select="*[not(self::enum)][not(self::header)][not(self::text)]"/>
    </xsl:template>
    <xsl:template match="*">
        <xsl:apply-templates select="." mode="block"/>
    </xsl:template>
    <xsl:template match="bill|legis-body" mode="block">
        <xsl:apply-templates mode="block"/>
    </xsl:template>
    <xsl:template match="p" mode="block">
        <p>
            <xsl:attribute name="itemtype">
                <xsl:value-of select="parent::*/name()"/>
            </xsl:attribute>
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates/>
        </p>
    </xsl:template>
    <xsl:template match="*" mode="block">
        <p>
            <xsl:attribute name="itemtype">
                <xsl:value-of select="name()"/>
            </xsl:attribute>
            <xsl:copy-of select="@*|text()"/>
        </p>
        <xsl:apply-templates select="*"/>
    </xsl:template>
    <xsl:template match="sourceCredit" mode="block">
        <p>
            <xsl:attribute name="itemtype">
                <xsl:value-of select="name()"/>
            </xsl:attribute>
            <xsl:apply-templates mode="inline"/>
        </p>
    </xsl:template>
    <xsl:template match="ref|date">
        <xsl:apply-templates select="." mode="inline"/>
    </xsl:template>
    <xsl:template match="*" mode="inline">
        <span>
            <xsl:attribute name="itemtype">
                <xsl:value-of select="name()"/>
            </xsl:attribute>
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates mode="inline"/>
        </span>
    </xsl:template>
</xsl:stylesheet>
